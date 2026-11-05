const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(process.argv[2], 'utf8');
const logoSource = fs.readFileSync(path.join(path.dirname(process.argv[2]), 'coffee-logo.js'), 'utf8');
function setup(reduced = false, failUpload = false) {
  let clock = 0, nextId = 0, draws = 0, uploads = 0;
  const frames = new Map();
  const images = [];
  const warnings = [], uniforms = {};
  const documentHandlers = {};
  const document = { hidden: false, visibilityState: 'visible', addEventListener: (name, callback) => { documentHandlers[name] = callback; } };
  let intersectionCallback;
  class IntersectionObserver {
    constructor(callback) { intersectionCallback = callback; }
    observe() {}
  }
  let iceDraws = [], drawMaterials = new Set();
  class Image {
    set src(value) { this.url = value; images.push(this); }
  }
  const gl = new Proxy({}, { get(target, key) {
    if (key === 'getShaderParameter' || key === 'getProgramParameter') return () => true;
    if (key === 'createShader' || key === 'createProgram' || key === 'createBuffer' || key === 'createTexture') return () => ({});
    if (key === 'getAttribLocation') return () => 0;
    if (key === 'getUniformLocation') return (_program, name) => name;
    if (key === 'uniform1f') return (name, value) => { assert.ok(Number.isFinite(value), 'uniform must be finite'); uniforms[name] = value; };
    if (key === 'uniform3fv' || key === 'uniform4fv') return (name, value) => { assert.ok([...value].every(Number.isFinite), 'uniform vector must be finite'); uniforms[name] = [...value]; };
    if (key === 'clear') return () => { iceDraws = []; drawMaterials = new Set(); };
    if (key === 'drawArrays') return () => {
      draws++;
      drawMaterials.add(uniforms.material);
      if (uniforms.material === 2) iceDraws.push({ scale: [...uniforms.scale], offset: [...uniforms.offset], cupSize: uniforms.cupSize });
    };
    if (key === 'bufferData') return (_target, data) => {
      assert.ok(data.length > 0 && data.length % 8 === 0, 'mesh has position, normal and UV vertices');
      assert.ok([...data].every(Number.isFinite), 'mesh data must be finite');
    };
    if (key === 'texImage2D') return (...args) => {
      assert.ok(args.at(-1) instanceof Uint8Array || args.at(-1) instanceof Image, 'texture upload has pixel data or an image');
      if (failUpload && args.at(-1) instanceof Image) throw Error('texture upload blocked');
      uploads++;
    };
    return () => {};
  }});
  const window = { devicePixelRatio: 1, matchMedia: () => ({ matches: reduced }), ResizeObserver: null, IntersectionObserver, addEventListener() {} };
  const context = { window, document, console: { ...console, warn: (...args) => warnings.push(args.map(String).join(' ')) }, Float32Array, Uint8Array, Image, Math, Event: class { constructor(type) { this.type = type; } }, performance: { now: () => clock }, requestAnimationFrame: fn => { frames.set(++nextId, fn); return nextId; }, cancelAnimationFrame: id => frames.delete(id) };
  vm.runInNewContext(logoSource, context);
  assert.ok(window.coffeeLogoSource.startsWith('data:image/png;base64,'), 'logo source is safe for local file previews');
  assert.deepEqual(Buffer.from(window.coffeeLogoSource.split(',')[1], 'base64'), fs.readFileSync(path.join(path.dirname(process.argv[2]), '..', 'Images', 'order', 'cba26.png')), 'embedded logo preserves the original image bytes');
  vm.runInNewContext(source, context);
  const handlers = {};
  const events = [];
  const canvas = { ownerDocument: document, clientWidth: 300, clientHeight: 420, width: 0, height: 0, getContext: () => gl, addEventListener: (name, fn) => { handlers[name] = fn; }, dispatchEvent: event => events.push(event.type) };
  return { window, canvas, handlers, events, frames, warnings, uniforms, get iceDraws() { return iceDraws; }, get drawMaterials() { return drawMaterials; }, setHidden(hidden) { document.hidden = hidden; document.visibilityState = hidden ? 'hidden' : 'visible'; documentHandlers.visibilitychange?.(); }, setIntersecting(isIntersecting) { intersectionCallback?.([{ target: canvas, isIntersecting }]); }, loadImages() { images.forEach(image => image.onload?.()); }, failImages() { images.forEach(image => image.onerror?.()); }, get imageSources() { return images.map(image => image.url); }, tick(ms) { clock += ms; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(clock)); }, get draws() { return draws; }, get uploads() { return uploads; } };
}
function assertIceFits(calls, count, cupSize) {
  assert.equal(calls.length, count, 'selected ice amount is rendered');
  for (const call of calls) {
    assert.equal(call.cupSize, cupSize, 'ice follows selected cup size');
    const [x, y, z] = call.offset;
    // A circumsphere contains the rounded cube at every rotation.
    const bound = Math.max(...call.scale) * Math.sqrt(3);
    const lowest = y - bound;
    assert.ok(lowest >= -1.4, 'settled ice stays above the base');
    assert.ok(y + bound <= 1.35, 'settled ice stays below the rim');
    const worldRadius = (Math.hypot(x, z) + bound) * cupSize;
    const cupRadius = (.64 + (lowest + 1.4) * .0945) * cupSize;
    assert.ok(worldRadius < cupRadius, 'settled ice stays inside the tapered wall');
  }
}
const state = { drink: 'Sa Poste Iced Coffee', ice: 'Regular ice', sweet: '50%', size: 'Regular', shot: false, oat: false };
const t = setup();
assert.equal(t.window.createCoffeeScene({getContext: () => null}), null, 'no WebGL must fall back');
assert.equal(t.window.createCoffeeScene({getContext: () => { throw Error('blocked'); }}), null, 'blocked WebGL must fall back');
const scene = t.window.createCoffeeScene(t.canvas);
assert.ok(scene && typeof scene.update === 'function', 'scene initializes');
assert.ok(t.imageSources.every(url => url.startsWith('data:image/png;base64,')), 'renderer uses the embedded logo rather than a file-origin image');
assert.equal(t.uploads, 1, 'texture starts with a safe placeholder');
scene.update(state);
t.loadImages();
assert.equal(t.uploads, 2, 'logo uploads after its image loads');
assert.equal(t.frames.size, 1, 'initial pour schedules animation');
const frameId = [...t.frames.keys()][0];
scene.update({ ...state });
assert.equal([...t.frames.keys()][0], frameId, 'unrelated update must not cancel animation');
t.tick(400);
assert.ok(t.draws > 0 && t.frames.size === 1, 'animation renders and continues');
assert.equal(t.uniforms.fill, -1.355, 'cup stays empty while the ice lands first');
assert.ok(!t.drawMaterials.has(4), 'pouring stream waits for the ice-first phase');
t.tick(650);
assert.ok(t.uniforms.fill > -1.355 && t.uniforms.fill < .98, 'coffee rises from the bottom after the ice delay');
t.tick(750);
assert.equal(t.uniforms.fill, .98, 'coffee finishes filling by 1800 ms');
t.tick(3000);
assert.equal(t.frames.size, 1, 'visible idle motion continues after the pour');
assertIceFits(t.iceDraws, 14, 1);
const beforeIdle = t.draws;
t.tick(100);
assert.ok(t.draws > beforeIdle && t.frames.size === 1, 'idle animation keeps rendering while visible');
scene.update({ ...state, ice: 'Extra ice' });
assert.equal(t.frames.size, 1, 'ice change animates');
t.tick(3000);
assertIceFits(t.iceDraws, 20, 1);
scene.update({ ...state, ice: 'Less ice' });
t.tick(3000);
assertIceFits(t.iceDraws, 7, 1);
scene.update({ ...state, ice: 'Extra ice', size: 'Large' });
t.tick(3000);
assertIceFits(t.iceDraws, 20, 1.10);
t.setHidden(true);
assert.equal(t.frames.size, 0, 'hidden pages stop scheduling frames');
const beforeHidden = t.draws;
t.tick(1000);
assert.equal(t.draws, beforeHidden, 'hidden pages do not render');
t.setHidden(false);
assert.equal(t.frames.size, 1, 'visible pages resume animation');
t.setIntersecting(false);
assert.equal(t.frames.size, 0, 'offscreen scenes stop scheduling frames');
t.tick(1000);
t.setIntersecting(true);
assert.equal(t.frames.size, 1, 'onscreen scenes resume animation');
t.handlers.webglcontextlost({ preventDefault() {} });
assert.deepEqual(t.events, ['coffee-scene-unavailable'], 'context loss notifies fallback');
assert.equal(t.frames.size, 0, 'context loss cancels animation');
t.loadImages();
assert.equal(t.uploads, 2, 'context loss prevents late texture uploads');
const reduced = setup(true);
const reducedScene = reduced.window.createCoffeeScene(reduced.canvas);
reducedScene.update(state);
assert.equal(reduced.frames.size, 0, 'reduced motion renders immediately');
assert.ok(reduced.draws > 0, 'reduced motion still draws');
const blocked = setup(false, true);
const rapid = setup();
const rapidScene = rapid.window.createCoffeeScene(rapid.canvas);
rapidScene.update(state);
rapid.tick(1050);
const partialFill = rapid.uniforms.fill;
rapidScene.update({ ...state, ice: 'Extra ice' });
assert.equal(rapid.uniforms.fill, partialFill, 'changing ice preserves the current fill height');
rapid.tick(100);
assert.ok(rapid.uniforms.fill > partialFill && rapid.uniforms.fill < .98, 'filling continues smoothly through a rapid ice change');
const blockedScene = blocked.window.createCoffeeScene(blocked.canvas);
blockedScene.update(state);
assert.doesNotThrow(() => blocked.loadImages(), 'late texture upload errors must be handled');
assert.doesNotThrow(() => blocked.failImages(), 'image load errors must be handled');
assert.ok(blocked.warnings.some(message => message.includes('texture unavailable')), 'upload failure records a diagnostic warning');
assert.ok(blocked.warnings.some(message => message.includes('image could not be loaded')), 'image load failure records a diagnostic warning');
console.log('Coffee scene checks passed');
