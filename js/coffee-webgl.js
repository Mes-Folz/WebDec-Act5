// Native WebGL: cup, liquid and decal share one tapered profile.
window.createCoffeeScene = function createCoffeeScene(canvas) {
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false }); } catch (_) { return null; }
  if (!gl) return null;

  try {
    const baseY = -1.4, baseRadius = .64, taper = .0945;
    function shader(type, source) {
      const result = gl.createShader(type);
      gl.shaderSource(result, source);
      gl.compileShader(result);
      if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(result));
      return result;
    }
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, `
      precision mediump float;
      attribute vec3 position, normal;
      attribute vec2 uv;
      uniform vec3 scale, offset, rotation;
      uniform float aspect, cupSize, fill, material, time;
      uniform vec4 framing;
      varying vec3 world, surfaceNormal;
      varying vec2 texcoord;
      mat3 rotate(vec3 a) {
        vec3 c = cos(a), s = sin(a);
        return mat3(c.y,0.,-s.y, 0.,1.,0., s.y,0.,c.y) *
          mat3(1.,0.,0., 0.,c.x,s.x, 0.,-s.x,c.x) *
          mat3(c.z,s.z,0., -s.z,c.z,0., 0.,0.,1.);
      }
      void main() {
        mat3 turn = rotate(rotation);
        vec3 p = turn * (position * scale) + offset;
        vec3 n = normalize(turn * (normal / scale));
        if (material == 1.) {
          // The liquid's radius follows the cup at the current fill height.
          p.y = -1.36 + (fill + 1.36) * (position.y * .5 + .5);
          p.xz = position.xz * (${baseRadius} + (p.y + ${-baseY}) * ${taper} - .025);
        }
        if (material == 4.) {
          float t = position.y * .5 + .5;
          p.y = mix(fill, 8., t);
          p.xz *= mix(.65,1.2,t) * (1. + .12 * sin(t * 25. - time * 17.));
          p.x += .8 * smoothstep(1.35,3.2,p.y) + .012 * sin(t * 16. + time * 15.);
        }
        p.xz *= cupSize;
        p.y = (p.y + 1.4) * cupSize - 1.4;
        world = p;
        surfaceNormal = n;
        texcoord = uv;
        float y = p.y * .9165 - p.z * .4;
        float z = p.y * .4 + p.z * .9165;
        float depth = 6.5 - z;
        float lens = 3.55;
        gl_Position = vec4(p.x * lens / aspect, (y - .02) * lens, depth * 1.02 - .65, depth);
        gl_Position.xy = gl_Position.xy * framing.xy + gl_Position.w * framing.zw;
      }
    `));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform vec4 color;
      uniform float material, fill, cupSize, time, opacity, milk;
      uniform sampler2D logo;
      varying vec3 world, surfaceNormal;
      varying vec2 texcoord;
      float noise(vec3 p) { return sin(p.x * 3. + sin(p.y * 2. + p.z * 3.)) * sin(p.y * 3. + p.z * 2.); }
      void main() {
        vec3 n = normalize(surfaceNormal);
        if (material == 0. && !gl_FrontFacing) n = -n;
        vec3 eye = normalize(vec3(0.,3.,6.5) - world);
        vec3 key = normalize(vec3(-3.,4.,5.));
        float diffuse = .72 + .28 * max(dot(n,key),0.);
        float fresnel = pow(1. - abs(dot(n,eye)), 3.);
        vec3 reflection = reflect(-eye,n);
        float softbox = pow(max(dot(reflection,normalize(vec3(-.65,.15,1.))),0.),24.);
        float edgebox = pow(max(dot(reflection,normalize(vec3(.9,.2,.5))),0.),45.);
        float specular = pow(max(dot(n,normalize(key + eye)),0.),80.);
        vec3 c = color.rgb;
        float alpha = color.a;
        if (material == 1.) {
          float h = clamp((world.y / cupSize + 1.4) / 2.7,0.,1.);
          float swirl = .5 + .5 * sin(h * 6. + noise(world * .8) * 2.);
          vec3 caramel = mix(vec3(.68,.34,.12),vec3(.90,.67,.42),milk);
          vec3 espresso = vec3(.18,.065,.025);
          c = mix(caramel,espresso,smoothstep(.35,.96,h) * (.35 + .5 * swirl) * (1. - milk * .45));
          c = mix(c,vec3(.93,.73,.48),smoothstep(.45,.95,swirl) * milk * .3);
          float ribbon = smoothstep(.65,.96,.5 + .5 * sin(world.y * 3. + world.x * 5. + noise(world * .6 + vec3(time*.018,0.,0.)) * 3.));
          c = mix(c,vec3(.96,.77,.52),ribbon * milk * .43);
          if (n.y > .6) c = mix(c,vec3(.38,.17,.065),.45) + .11 * specular;
          c *= diffuse;
          c += vec3(1.,.85,.64) * (softbox * .22 + edgebox * .16);
        } else if (material == 2. || material == 7.) {
          // Tinted centres and sharp studio reflections make the ice read as clear, wet ice.
          float level = (fill + 1.4) * cupSize - 1.4;
          if (material == 7. && world.y > level) discard;
          float submerged = 1. - smoothstep(level - .12, level + .12,world.y);
          vec3 transmission = mix(vec3(.79,.64,.44),vec3(.64,.36,.16),submerged * .65);
          float fissure = pow(max(0.,1. - abs(sin(world.x * 34. + world.y * 22. + world.z * 17.)) * 18.),3.);
          c = transmission * (.69 + .22 * diffuse);
          c = mix(c,vec3(.98,.99,.98),fresnel * .9);
          float windowReflection = pow(max(0.,1. - abs(reflection.x + .35) * 7.),4.) * smoothstep(.1,.8,reflection.z);
          c += windowReflection * .8;
          float ceiling = pow(max(dot(reflection,normalize(vec3(-.2,.75,-.63))),0.),18.);
          c += ceiling * .85;
          c += vec3(1.,.98,.9) * (softbox * .75 + edgebox * .9 + specular * .8 + fissure * .13);
          float bevel = pow(1. - min(sin(texcoord.x * 3.14159),sin(texcoord.y * 3.14159)),4.);
          c += vec3(.82,.91,.94) * bevel * .65;
          alpha = opacity * (.76 + fresnel * .23);
          if (material == 7.) alpha *= .36;
        } else if (material == 4.) {
          c = color.rgb * (.8 + .2 * diffuse) + vec3(.92,.62,.29) * (softbox * .45 + specular * .5);
        } else if (material == 3.) {
          if (length(texcoord - .5) > .49) discard;
          vec4 decal = texture2D(logo,texcoord);
          gl_FragColor = vec4(decal.rgb * (.9 + .1 * diffuse),decal.a * opacity);
          return;
        } else if (material == 0.) {
          float strip = pow(max(0.,1. - abs(n.x + .64) * 7.),2.);
          float edge = pow(max(0.,1. - abs(n.x - .88) * 14.),2.);
          c = vec3(.98,.97,.92) + vec3(softbox * .4 + edgebox * .5 + specular * .2);
          alpha = opacity * (.018 + fresnel * .45 + softbox * .18 + edgebox * .25 + strip * .38 + edge * .42);
        } else if (material == 5.) {
          c = mix(vec3(.62,.53,.39),vec3(1.,.98,.91),.35 + fresnel * .65);
          c += softbox * .45 + edgebox * .5 + specular * .4;
          alpha *= .7 + .3 * fresnel;
        } else { c = c * diffuse + specular * .35; }
        gl_FragColor = vec4(c,clamp(alpha,0.,1.));
      }
    `));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const uniforms = {};
    ['scale','offset','rotation','aspect','cupSize','fill','material','time','color','opacity','milk','logo','framing'].forEach(name => { uniforms[name] = gl.getUniformLocation(program,name); });
    const attributes = ['position','normal','uv'].map(name => gl.getAttribLocation(program,name));
    function mesh(vertices) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
      return { buffer, count: vertices.length / 8 };
    }
    function grid(rows, columns, vertex) {
      const data = [];
      for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
        const a = vertex(x / columns,y / rows), b = vertex((x + 1) / columns,y / rows);
        const c = vertex((x + 1) / columns,(y + 1) / rows), d = vertex(x / columns,(y + 1) / rows);
        data.push(...a,...b,...c,...a,...c,...d);
      }
      return mesh(data);
    }
    const radiusAt = y => baseRadius + (y - baseY) * taper;
    const cup = grid(1,96,(u,v) => {
      const a = u * Math.PI * 2, y = -1.4 + v * 2.75, r = radiusAt(y);
      return [r * Math.sin(a),y,r * Math.cos(a),Math.sin(a),-.0945,Math.cos(a),u,v];
    });
    const liquid = grid(1,96,(u,v) => { const a = u * Math.PI * 2; return [Math.sin(a),v * 2 - 1,Math.cos(a),Math.sin(a),0,Math.cos(a),u,v]; });
    const surface = grid(1,96,(u,v) => { const a = u * Math.PI * 2; return [Math.sin(a) * v,1,Math.cos(a) * v,0,1,0,u,v]; });
    const ring = grid(12,96,(u,v) => {
      const a = u * Math.PI * 2, b = v * Math.PI * 2, r = 1 + .025 * Math.cos(b);
      return [r * Math.sin(a),.025 * Math.sin(b),r * Math.cos(a),Math.sin(a) * Math.cos(b),Math.sin(b),Math.cos(a) * Math.cos(b),u,v];
    });
    const decal = grid(8,32,(u,v) => {
      const a = (u - .5) * 1.10, y = -.73 + v * .84, r = radiusAt(y) + .018;
      return [r * Math.sin(a),y,r * Math.cos(a),Math.sin(a),-.0945,Math.cos(a),u,v];
    });
    const iceData = [];
    const faces = [[0,1,2,1],[0,1,2,-1],[2,1,0,1],[2,1,0,-1],[0,2,1,1],[0,2,1,-1]];
    faces.forEach(([axisA,axisB,axisC,sign]) => {
      function vertex(u,v) {
        const p = [0,0,0]; p[axisA] = u * 2 - 1; p[axisB] = v * 2 - 1; p[axisC] = sign;
        const core = p.map(n => Math.max(-.72,Math.min(.72,n)));
        const d = p.map((n,i) => n - core[i]), len = Math.hypot(...d);
        const n = d.map(a => a / len);
        return [...core.map((a,i) => a + n[i] * .28),...n,u,v];
      }
      for (let y=0;y<6;y++) for(let x=0;x<6;x++) {
        const a=vertex(x/6,y/6),b=vertex((x+1)/6,y/6),c=vertex((x+1)/6,(y+1)/6),d=vertex(x/6,(y+1)/6);
        iceData.push(...a,...b,...c,...a,...c,...d);
      }
    });
    const ice = mesh(iceData);
    const stream = grid(40,24,(u,v)=>{const a=u*Math.PI*2;return [Math.sin(a),v*2-1,Math.cos(a),Math.sin(a),0,Math.cos(a),u,v];});
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([157,22,15,255]));
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    let textureReady = false;
    const image = new Image();
    image.onload = () => {
      if (lost) return;
      try {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
        textureReady = true;
        draw(performance.now());
      } catch(error) { console.warn('Cup logo texture unavailable:',error); }
    };
    image.onerror = () => console.warn('Cup logo image could not be loaded.');
    image.src = window.coffeeLogoSource;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const iceCount = value => value === 'Less ice' ? 7 : value === 'Extra ice' ? 20 : 14;
    const smooth = t => { t = Math.max(0,Math.min(1,t)); return t*t*(3-2*t); };
    // Bound each rounded cube by its circumsphere, including while it tumbles.
    const spots = [[1,-.95,.23,0],[3,-.44,.22,.27],[4,.04,.22,.32],[5,.50,.21,.38],[7,.92,.205,.41]].flatMap(([count,y,size,r],layer)=>
      Array.from({length:count},(_,i)=>{
        const centre=count===1 || (layer===4 && i===0);
        const a=(layer===4?i-1:i)*Math.PI*2/(layer===4?6:count)+layer*.25;
        return [centre?0:Math.cos(a)*r,centre?0:Math.sin(a)*r,size,y];
      }));
    const particles = spots.map(()=>({y:-1.1,vy:0,amount:0,spawnAt:0}));
    let state = null, previous = null, frame = 0, lost = false, started = 0, effect = '', progress = 1;
    let displayedSize = 1, sizeFrom = 1, displayedMilk = .45, milkFrom = .45, fillFrom = .98;
    let liquidLevel = .98;
    let fillStarted = 0, filling = false;
    let lastDraw = 0, sugarDelta = 0;
    let inView = true;
    let pausedAt = null;
    const pageDocument = canvas.ownerDocument || (typeof document !== 'undefined' ? document : null);
    const duration = 850;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0,0,0,0);
    gl.uniform1i(uniforms.logo,0);

    function object(shape, material, scale = [1,1,1], offset = [0,0,0], rotation = [0,0,0], color = [1,1,1,1], opacity = 1) {
      gl.bindBuffer(gl.ARRAY_BUFFER,shape.buffer);
      attributes.forEach((attribute,i) => { gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute,i === 2 ? 2 : 3,gl.FLOAT,false,32,i === 2 ? 24 : i * 12); });
      gl.uniform3fv(uniforms.scale,scale); gl.uniform3fv(uniforms.offset,offset); gl.uniform3fv(uniforms.rotation,rotation);
      gl.uniform4fv(uniforms.color,color); gl.uniform1f(uniforms.opacity,opacity); gl.uniform1f(uniforms.material,material);
      gl.drawArrays(gl.TRIANGLES,0,shape.count);
    }
    function draw(now) {
      if (lost || !state || !canvas.clientWidth || !canvas.clientHeight) return;
      const elapsed = Math.max(0,now-started);
      progress = motion.matches ? 1 : Math.min(1,elapsed/duration);
      const dt = Math.min(.033,Math.max(0,(now-lastDraw)/1000));
      lastDraw=now;
      const ease = smooth(progress), count = iceCount(state.ice);
      const springEase = progress === 1 ? 1 : 1-Math.exp(-7*progress)*Math.cos(11*progress);
      displayedSize = sizeFrom + ((state.size === 'Large' ? 1.10 : 1) - sizeFrom) * springEase;
      const milkTarget = Math.max(0,(state.oat || /latte/i.test(state.drink) ? .9 : /americano/i.test(state.drink) ? .05 : .45) - (state.shot ? .10 : 0));
      displayedMilk = milkFrom + (milkTarget-milkFrom) * ease;
      const fillProgress=motion.matches?1:Math.max(0,Math.min(1,(now-fillStarted)/duration));
      liquidLevel=filling?fillFrom+(.98-fillFrom)*smooth(fillProgress/.87):.98;
      if(fillProgress>=1)filling=false;
      const ratio = Math.min(window.devicePixelRatio || 1,2);
      const w = Math.max(1,Math.round(canvas.clientWidth * ratio)), h = Math.max(1,Math.round(canvas.clientHeight * ratio));
      if(canvas.width!==w || canvas.height!==h){canvas.width=w;canvas.height=h;}
      gl.viewport(0,0,w,h); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const phone = canvas.clientWidth <= 700 && window.innerWidth <= 700;
      const compact = phone && canvas.clientHeight<=160;
      const expanded = phone && canvas.clientHeight>160 && canvas.clientHeight<=400;
      const viewWidth = Math.min(canvas.clientWidth*.94,compact?115:expanded?220:phone?300:380), viewHeight=compact?145:expanded?280:phone?390:480;
      const viewTop=compact?-10:expanded?0:178;
      gl.uniform1f(uniforms.aspect,viewWidth/viewHeight);
      gl.uniform4fv(uniforms.framing,[viewWidth/canvas.clientWidth,viewHeight/canvas.clientHeight,0,1-(2*viewTop+viewHeight)/canvas.clientHeight]);
      gl.uniform1f(uniforms.cupSize,displayedSize);
      gl.uniform1f(uniforms.fill,liquidLevel); gl.uniform1f(uniforms.time,now/1000); gl.uniform1f(uniforms.milk,displayedMilk);
      gl.depthMask(false);
      gl.enable(gl.CULL_FACE); gl.cullFace(gl.FRONT);
      object(cup,0);
      gl.disable(gl.CULL_FACE); gl.depthMask(true);
      object(liquid,1); object(surface,1);
      const pouring = filling || (effect === 'milk' && state.oat) || (effect === 'shot' && state.shot);
      const pourProgress=filling?fillProgress:progress;
      if (pouring && pourProgress > .005 && pourProgress < .91) {
        const strength = Math.min(smooth(pourProgress/.1),1-smooth((pourProgress-.77)/.14));
        object(stream,4,[.035*strength,1,.035*strength],[-.12,0,-.05],[0,0,0],effect==='milk'?[.94,.80,.60,1]:[.40,.17,.055,1]);
        const wave = (progress * 4) % 1;
        object(ring,5,[.08+wave*.42, .25, .08+wave*.42],[-.12,liquidLevel+.008,-.05],[0,0,0],[.85,.56,.28,(1-wave)*strength*.7]);
        for(let i=0;i<4;i++){
          const t=(progress*3+i*.25)%1, a=i*2.4;
          object(ice,6,[.018,.025,.018],[-.12+Math.cos(a)*t*.18,liquidLevel+Math.sin(t*Math.PI)*.14,-.05+Math.sin(a)*t*.18],[0,0,0],[.64,.34,.12,(1-t)*strength]);
        }
      }
      spots.map((spot,i)=>({spot,i})).sort((a,b)=>a.spot[1]-b.spot[1]).forEach(({spot,i})=>{
        const [sx,sz,radius,stackY] = spot, body=particles[i], bound=radius*Math.sqrt(3);
        const wanted=i<count;
        if (now<body.spawnAt && !motion.matches) return;
        const settled=motion.matches || elapsed>=2400;
        const idle=motion.matches?0:Math.sin(now*.0016+i)*.006;
        const lift=smooth((liquidLevel-stackY)/.5)*.018;
        const target=Math.min(1.35-bound-.025,stackY+lift+idle);
        if (settled) {body.y=target;body.vy=0;body.amount=wanted?1:0;}
        else {
          body.amount+=( (wanted?1:0)-body.amount)*Math.min(1,dt*15);
          // shortcut: a layered pack and damped springs approximate stacking and buoyancy.
          if(body.y>target+.12 && body.vy<=0)body.vy-=18*dt;
          else body.vy+=((target-body.y)*100-body.vy*10)*dt;
          body.y+=body.vy*dt;
          body.y=Math.max(baseY+.045+bound,body.y);
        }
        if(body.amount<.01)return;
        const residual=settled?0:Math.sin(elapsed*.008+i)*.012*Math.exp(-elapsed/1000);
        const height=body.y+residual;
        const safeRadius=Math.max(0,radiusAt(Math.max(baseY,Math.min(1.35,height-bound)))-bound-.035);
        const drift=motion.matches?0:Math.sin(now*.0012+i)*.006;
        let x=sx+drift, z=sz+drift*.5;
        const radial=Math.hypot(x,z);
        if(radial>safeRadius){x*=safeRadius/radial;z*=safeRadius/radial;}
        const amount=body.amount;
        const size=[radius*amount,radius*.84*amount,radius*amount], at=[x,height,z];
        const wobble=motion.matches?0:Math.sin(now*.0018+i)*.012+(settled?0:Math.sin(elapsed*.012+i)*Math.exp(-elapsed/650)*.22);
        const turn=[.10+i*.20+wobble,.23+i*.63,wobble+i*.17];
        object(ice,2,size,at,turn,[1,1,1,1],amount);
        gl.depthMask(false); gl.disable(gl.DEPTH_TEST);
        object(ice,7,size,at,turn,[1,1,1,1],amount);
        gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
      });
      if(effect==='sugar' && progress<1) {
        const removing=sugarDelta<0;
        const grains=Math.min(30,8+Math.abs(sugarDelta)/3);
        for(let i=0;i<grains;i++) {
          const t=(progress-i*.012)/.65;
          if(t<0 || t>1)continue;
          const angle=i*2.4+t*6, radius=.05+t*.18;
          const y=removing?liquidLevel+Math.sin(t*Math.PI*.5)*.8:liquidLevel+Math.max(0,1-t*t*1.7)*.85+Math.abs(Math.sin(t*Math.PI*3))*.05;
          const fade=removing?1-t:1-smooth((t-.65)/.35);
          object(ice,6,[.018,.018,.018],[Math.cos(angle)*radius,y,Math.sin(angle)*radius],[t*4,i,t*3],[1,.94,.75,fade]);
        }
        const wave=(progress*2)%1;
        object(ring,5,[.1+wave*.35,.2,.1+wave*.35],[0,liquidLevel+.012,0],[0,0,0],[1,.84,.58,(1-wave)*.5]);
      }
      gl.depthMask(false);
      gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); object(cup,0); gl.disable(gl.CULL_FACE);
      object(ring,5,[.90,1,.90],[0,1.35,0],[0,0,0],[1,.97,.91,.9]);
      object(ring,5,[.885,.6,.885],[0,1.30,0],[0,0,0],[1,.97,.91,.55]);
      object(ring,5,[.65,1.2,.65],[0,-1.38,0],[0,0,0],[1,.97,.91,.75]);
      if(textureReady){
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.disable(gl.DEPTH_TEST); object(decal,3); gl.enable(gl.DEPTH_TEST);
      }
      gl.depthMask(true);
    }
    function canAnimate(){return !lost && inView && !pageDocument?.hidden && !motion.matches;}
    function animate(now){
      frame=0;
      if(!canAnimate())return;
      if(now-lastDraw>=1000/30)draw(now);
      frame=requestAnimationFrame(animate);
    }
    function startLoop(){
      cancelAnimationFrame(frame);frame=0;
      if(!state || lost)return;
      const now=performance.now();
      if(motion.matches){pausedAt=null;draw(Math.max(now,started+2400));return;}
      if(!canAnimate()){if(pausedAt===null)pausedAt=now;return;}
      if(pausedAt!==null){
        const delay=now-pausedAt;
        started+=delay;fillStarted+=delay;particles.forEach(body=>body.spawnAt+=delay);
        pausedAt=null;
      }
      lastDraw=now;frame=requestAnimationFrame(animate);
    }
    function update(next) {
      if(lost)return;
      const changed = !state || state.drink!==next.drink ? 'coffee' : state.oat!==next.oat ? 'milk' : state.shot!==next.shot ? 'shot' : state.ice!==next.ice ? 'ice' : state.sweet!==next.sweet ? 'sugar' : state.size!==next.size ? 'size' : '';
      if(!changed)return;
      if(state)draw(performance.now());
      previous=state; state={...next}; effect=changed;
      sizeFrom=displayedSize; milkFrom=displayedMilk;
      if(changed==='coffee'){fillFrom=-1.355;fillStarted=performance.now()+800;filling=true;}
      sugarDelta=parseInt(state.sweet,10)-(previous?parseInt(previous.sweet,10):0);
      const oldCount=previous?iceCount(previous.ice):0, count=iceCount(state.ice);
      particles.forEach((body,i)=>{
        if(i<count && (i>=oldCount || changed==='coffee')){
          body.y=1.8+(i%3)*.08;
          body.vy=-.2;
          body.spawnAt=performance.now()+(changed==='coffee'?i*18:Math.max(0,i-oldCount)*22);
          body.amount=0;
        }
      });
      started=performance.now(); lastDraw=started; pausedAt=null;
      startLoop();
    }
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);canvas.dispatchEvent(new Event('coffee-scene-unavailable'));});
    const resize=()=>draw(performance.now());
    if(window.ResizeObserver)new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize',resize);
    motion.addEventListener?.('change',startLoop);
    pageDocument?.addEventListener('visibilitychange',startLoop);
    if(window.IntersectionObserver)new window.IntersectionObserver(entries=>{inView=entries[0].isIntersecting;startLoop();},{threshold:0}).observe(canvas);
    return {update};
  } catch(error) {
    console.warn('Coffee scene unavailable:',error);
    return null;
  }
};
