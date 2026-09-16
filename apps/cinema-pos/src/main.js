import './style.css';

const DEMO_PRODUCTS = [
  { sku: 'TKT-AVN', name: 'Tiket Avatar Re-Release', category: 'ticket', price: 65000 },
  { sku: 'TKT-DNE', name: 'Tiket Dune Part Three', category: 'ticket', price: 70000 },
  { sku: 'SNK-POP', name: 'Popcorn Large', category: 'snack', price: 45000 },
  { sku: 'SNK-SOD', name: 'Soda Medium', category: 'snack', price: 25000 },
  { sku: 'SNK-COM', name: 'Combo Popcorn + Soda', category: 'snack', price: 60000 }
];

const formatIdr = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

async function loadConfig() {
  try {
    const res = await fetch('/config.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('no config');
    return await res.json();
  } catch {
    return {
      outletCode: 'LAB',
      outletName: 'Cinema Lab (local preview)',
      appTitle: 'Cinema POS',
      database: { note: 'Config akan di-inject Ansible saat deploy.' }
    };
  }
}

function render(config) {
  const cart = new Map();

  const app = document.querySelector('#app');
  app.innerHTML = `
    <header class="top">
      <div>
        <p class="eyebrow">${config.appTitle || 'Cinema POS'}</p>
        <h1>${config.outletName}</h1>
        <p class="meta">Outlet code: <strong>${config.outletCode}</strong></p>
      </div>
      <div class="badge">${config.outletCode}</div>
    </header>

    <main class="layout">
      <section>
        <h2>Menu</h2>
        <div class="grid" id="products"></div>
      </section>
      <aside class="cart">
        <h2>Keranjang</h2>
        <ul id="cart-items"></ul>
        <div class="total">
          <span>Total</span>
          <strong id="cart-total">${formatIdr(0)}</strong>
        </div>
        <button id="checkout" type="button">Checkout Demo</button>
        <p class="hint">${config.database?.note || ''}</p>
      </aside>
    </main>
  `;

  const productsEl = document.getElementById('products');
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');

  const refreshCart = () => {
    cartItemsEl.innerHTML = '';
    let total = 0;
    for (const [sku, item] of cart.entries()) {
      total += item.price * item.qty;
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.name} × ${item.qty}</span><span>${formatIdr(item.price * item.qty)}</span>`;
      li.dataset.sku = sku;
      cartItemsEl.appendChild(li);
    }
    cartTotalEl.textContent = formatIdr(total);
  };

  DEMO_PRODUCTS.forEach((p) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.innerHTML = `
      <span class="cat">${p.category}</span>
      <strong>${p.name}</strong>
      <span class="price">${formatIdr(p.price)}</span>
    `;
    card.addEventListener('click', () => {
      const existing = cart.get(p.sku) || { ...p, qty: 0 };
      existing.qty += 1;
      cart.set(p.sku, existing);
      refreshCart();
    });
    productsEl.appendChild(card);
  });

  document.getElementById('checkout').addEventListener('click', () => {
    if (cart.size === 0) {
      alert('Keranjang masih kosong.');
      return;
    }
    alert(`Demo checkout di ${config.outletName} (${config.outletCode}). Data order siap dicatat ke PostgreSQL di server outlet.`);
    cart.clear();
    refreshCart();
  });
}

loadConfig().then(render);
