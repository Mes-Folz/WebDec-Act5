const drinks = [
  { name: 'Sa Poste Iced Coffee', price: 99, detail: 'The house favorite' },
  { name: 'Iced Americano*', price: 99, detail: 'Bold & easygoing' },
  { name: 'Iced Latte*', price: 119, detail: 'Smooth & mellow' },
  { name: 'Spanish Latte*', price: 129, detail: 'A little sweeter' }
];
const form = document.querySelector('#custom-form');
const list = document.querySelector('#drink-list');
const items = [];
const menuProducts = {
  'cheese-rolls': { name: 'Cheese Rolls (Box of 5)', price: 360, description: 'Soft, golden bread filled with rich, gooey cheese and brushed with buttery goodness.', image: 'Images/cheeserolls.jfif' },
  ensaymada: { name: 'Ensaymada Ball', price: 65, description: 'A soft brioche roll topped with butter, sugar, and grated cheese.', image: 'Images/Ensaymada-balls.jpg' },
  'banana-yogurt': { name: 'Banana Iced Yogurt', price: 120, description: 'A refreshing blend of real yogurt and banana, lightly sweetened and served over ice.', image: 'Images/BananicedYogurt.jfif' },
  'strawberry-frappe': { name: 'Strawberry Frappe', price: 135, description: 'Blended strawberry and cream, topped with whipped cream.', image: 'Images/strawberry-frappe.jpg' },
  'buko-peanut': { name: 'Buko-Peanut Shake', price: 140, description: 'Young coconut blended with roasted peanut cream.', image: 'Images/buko-peanutshake.jfif' }
};
let drink = drinks[0];
let quantity = 1;
const stage = document.querySelector('.stage');
const canvas = document.createElement('canvas');
canvas.className = 'coffee-scene';
canvas.setAttribute('aria-hidden', 'true');
canvas.id = 'preview-canvas';
stage.append(canvas);
const coffeeScene = window.createCoffeeScene?.(canvas);
if (coffeeScene) stage.classList.add('has-webgl');
canvas.addEventListener('coffee-scene-unavailable', () => stage.classList.remove('has-webgl'));
const money = value => `₱${value}`;
const selected = name => form.elements[name].value;
const unitPrice = () => drink.price + (selected('size') === 'Large' ? 20 : 0) + (form.elements.shot.checked ? 20 : 0) + (form.elements.oat.checked ? 25 : 0);
const addButton = form.querySelector('[type="submit"]');
const orderBag = document.querySelector('.bag');
let feedbackTimer;

function confirmOrder() {
  clearTimeout(feedbackTimer);
  addButton.classList.remove('order-added');
  orderBag.classList.remove('bag-added');
  void addButton.offsetWidth;
  addButton.firstElementChild.textContent = '✓';
  addButton.classList.add('order-added');
  orderBag.classList.add('bag-added');
  feedbackTimer = setTimeout(() => {
    addButton.classList.remove('order-added');
    orderBag.classList.remove('bag-added');
    addButton.firstElementChild.textContent = '＋';
  }, 850);
}

function renderDrinks() {
  list.innerHTML = '';
  drinks.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `drink-card${item === drink ? ' selected' : ''}`;
    button.setAttribute('aria-pressed', String(item === drink));
    button.innerHTML = `<span class="drink-row">${index === 0 ? '<img src="Images/order/coffee.png" alt="">' : '<span class="drink-icon"><img src="Images/order/cup.svg" alt=""></span>'}<span>${item.name}<b>${money(item.price)}</b></span></span><small>${item.detail}</small>`;
    button.addEventListener('click', () => { drink = item; renderDrinks(); update(); });
    list.append(button);
  });
}

function update() {
  const total = unitPrice() * quantity;
  document.querySelector('#drink-name').textContent = drink.name;
  document.querySelector('#base-price').textContent = money(drink.price);
  document.querySelector('#quantity').textContent = quantity;
  document.querySelector('#total').textContent = money(total);
  document.querySelector('#button-total').textContent = money(total);
  document.querySelector('#calculation').textContent = `${money(unitPrice())} per cup × ${quantity}`;
  document.querySelector('#sweet-caption').textContent = `${selected('sweet')} sweet`;
  document.querySelector('#ice-label').textContent = selected('ice').toUpperCase();
  document.querySelector('#sweet-label').textContent = `${selected('sweet')} SWEET`;
  document.querySelector('#stage-summary').textContent = `${selected('size')} CUP / ${selected('ice')} / ${selected('sweet')} SWEET`.toUpperCase();
  document.querySelector('#preview-summary').textContent = `${selected('size')} · ${selected('ice')} · ${selected('sweet')} sweet`;
  const cubes = document.querySelectorAll('.cube');
  cubes.forEach((cube, i) => { cube.hidden = selected('ice') === 'Less ice' ? i > 0 : selected('ice') === 'Regular ice' ? i > 2 : false; });
  coffeeScene?.update({ ice: selected('ice'), sweet: selected('sweet'), drink: drink.name, size: selected('size'), shot: form.elements.shot.checked, oat: form.elements.oat.checked });
}

const previewToggle = document.querySelector('#preview-toggle');
const previewExpand = document.querySelector('#preview-expand');
previewToggle.addEventListener('click', () => {
  const hidden = stage.classList.toggle('preview-hidden');
  stage.classList.remove('preview-expanded');
  previewToggle.textContent = hidden ? 'Show drink' : 'Hide';
  previewToggle.setAttribute('aria-expanded', String(!hidden));
  previewExpand.hidden = hidden;
  previewExpand.textContent = 'Expand';
  previewExpand.setAttribute('aria-expanded', 'false');
});
previewExpand.addEventListener('click', () => {
  const expanded = stage.classList.toggle('preview-expanded');
  previewExpand.textContent = expanded ? 'Compact' : 'Expand';
  previewExpand.setAttribute('aria-expanded', String(expanded));
});

function renderOrder() {
  const container = document.querySelector('#order-items');
  container.replaceChildren();
  let count = 0, total = 0;
  items.forEach((item, index) => {
    count += item.quantity;
    total += item.price * item.quantity;
    const row = document.createElement('div');
    row.className = 'order-item';
    if (item.coffee) {
      const image = document.createElement('img'); image.src = 'Images/order/coffee.png'; image.alt = ''; row.append(image);
    }
    const details = document.createElement('div');
    const heading = document.createElement('p');
    const name = document.createElement('span'); name.textContent = item.name;
    const price = document.createElement('strong'); price.textContent = money(item.price * item.quantity);
    heading.append(name, price); details.append(heading);
    const description = document.createElement('small'); description.textContent = `${item.description} · Qty ${item.quantity}`; details.append(description);
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.addEventListener('click', () => { items.splice(index, 1); renderOrder(); }); details.append(remove);
    row.append(details); container.append(row);
  });
  document.querySelector('#bag-count').textContent = count;
  document.querySelector('#item-count').textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  document.querySelector('#summary-status').textContent = count ? '✓ Your selection is in the bag.' : 'Your order is empty.';
  document.querySelector('#subtotal').textContent = money(total);
  document.querySelector('#grand-total').textContent = money(total);
}

form.addEventListener('change', update);
form.addEventListener('submit', event => {
  event.preventDefault();
  const extras = [form.elements.shot.checked && 'Extra espresso shot', form.elements.oat.checked && 'Oat milk'].filter(Boolean);
  const note = form.elements.note.value.trim();
  items.push({ name: drink.name, price: unitPrice(), quantity, coffee: true, description: [selected('size'), selected('ice'), `${selected('sweet')} sweet`, ...extras, note && `Note: ${note}`].filter(Boolean).join(' · ') });
  renderOrder();
  document.querySelector('#summary-status').textContent = '✓ Added to your demonstration order.';
  confirmOrder();
});
document.querySelector('#minus').addEventListener('click', () => { quantity = Math.max(1, quantity - 1); update(); });
document.querySelector('#plus').addEventListener('click', () => { quantity = Math.min(99, quantity + 1); update(); });
document.querySelectorAll('[data-pair]').forEach(button => button.addEventListener('click', () => { items.push({ name: button.dataset.pair, price: Number(button.dataset.price), quantity: 1, description: 'Pairing' }); renderOrder(); }));
const productId = new URLSearchParams(window.location.search).get('product');
if (Object.hasOwn(menuProducts, productId)) {
  const product = menuProducts[productId];
  document.querySelector('.intro h1').textContent = product.name;
  document.querySelector('.intro > div > p:last-child').textContent = 'Review your selection and add it to your demonstration order.';
  const preview = document.createElement('section');
  preview.className = 'product-preview page-pad';
  preview.setAttribute('aria-label', 'Selected product');
  preview.innerHTML = `<img src="${product.image}" alt=""><div><p class="eyebrow">YOUR MENU SELECTION</p><h2>${product.name}</h2><p>${product.description}</p><p class="product-price">${money(product.price)}</p><button class="primary" type="button">Add to order <span>＋</span></button><a href="products.html">← Back to menu</a></div>`;
  document.querySelector('.atelier').hidden = true;
  document.querySelector('.atelier').before(preview);
  preview.querySelector('button').addEventListener('click', () => {
    items.push({ name: product.name, price: product.price, quantity: 1, description: 'Menu selection' });
    renderOrder();
    document.querySelector('#summary-status').textContent = '✓ Added to your demonstration order.';
    document.querySelector('#order-summary').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
renderDrinks(); update(); renderOrder();
