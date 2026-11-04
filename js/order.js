const drinks = [
  { name: 'Sa Poste Iced Coffee', price: 99, detail: 'The house favorite' },
  { name: 'Iced Americano*', price: 99, detail: 'Bold & easygoing' },
  { name: 'Iced Latte*', price: 119, detail: 'Smooth & mellow' },
  { name: 'Spanish Latte*', price: 129, detail: 'A little sweeter' }
];
const form = document.querySelector('#custom-form');
const list = document.querySelector('#drink-list');
const items = [];
let drink = drinks[0];
let quantity = 1;
const money = value => `₱${value}`;
const selected = name => form.elements[name].value;
const unitPrice = () => drink.price + (selected('size') === 'Large' ? 20 : 0) + (form.elements.shot.checked ? 20 : 0) + (form.elements.oat.checked ? 25 : 0);

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
  const cubes = document.querySelectorAll('.cube');
  cubes.forEach((cube, i) => { cube.hidden = selected('ice') === 'Less ice' ? i > 0 : selected('ice') === 'Regular ice' ? i > 2 : false; });
}

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
});
document.querySelector('#minus').addEventListener('click', () => { quantity = Math.max(1, quantity - 1); update(); });
document.querySelector('#plus').addEventListener('click', () => { quantity = Math.min(99, quantity + 1); update(); });
document.querySelectorAll('[data-pair]').forEach(button => button.addEventListener('click', () => { items.push({ name: button.dataset.pair, price: Number(button.dataset.price), quantity: 1, description: 'Pairing' }); renderOrder(); }));
const theme = document.querySelector('#theme');
theme.addEventListener('click', () => { const dark = document.body.classList.toggle('dark'); theme.textContent = dark ? '☀' : '☾'; theme.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme'); });
const menu = document.querySelector('.mobile-menu');
menu.addEventListener('click', () => { const open = document.querySelector('#navigation').classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
renderDrinks(); update(); renderOrder();
