// --- SCROLL REVEAL ANIMATIONS ---
const revealElements = document.querySelectorAll('.reveal');

const revealOptions = {
  threshold: 0.15,
  rootMargin: "0px 0px -50px 0px",
};

const revealOnScroll = new IntersectionObserver(function (entries, observer) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('active');
    observer.unobserve(entry.target);
  });
}, revealOptions);

revealElements.forEach((el) => {
  revealOnScroll.observe(el);
});

// --- GALLERY CAROUSEL LOGIC ---
function scrollCarousel(direction) {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const scrollAmount = track.clientWidth * 0.8;
  track.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
}

// --- E-COMMERCE LOGIC ---
let cart = [];

function addToCart(id, name, price) {
  cart.push({ id, name, price });
  updateCartUI();

  const drawer = document.getElementById('cartDrawer');
  if (drawer && !drawer.classList.contains('active')) {
    toggleCart();
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function updateCartUI() {
  const container = document.getElementById('cartItemsContainer');
  const countEl = document.getElementById('cart-count');
  const totalEl = document.getElementById('cartTotal');

  if (!container || !countEl || !totalEl) return;

  countEl.innerText = cart.length;

  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align:center; color: #888; margin-top: 2rem;">Your cart is empty.</p>';
    totalEl.innerText = '₱0.00';
    return;
  }

  let html = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    html += `
      <div class="cart-item">
        <div class="item-info">
          <h4 style="margin-bottom: 0.2rem;">${item.name}</h4>
          <p style="font-weight: 600; color: #000;">₱${item.price.toLocaleString()}</p>
        </div>
        <button style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.8rem; text-decoration: underline;" onclick="removeFromCart(${index})">Remove</button>
      </div>
    `;
  });

  container.innerHTML = html;
  totalEl.innerText = '₱' + total.toLocaleString();
}

function toggleCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer) drawer.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
}

function formatMoneyPHP(amount) {
  return '₱' + amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function generateOrderId() {
  // #PEP-1001 style incremental ID persisted in localStorage
  const key = 'pepzy_order_counter';
  const current = parseInt(localStorage.getItem(key) || '1000', 10);
  const next = current + 1;
  localStorage.setItem(key, String(next));
  return `#PEP-${next}`;
}

// On-site QR payment is intentionally removed for this workflow.
function backToCheckout() {
  return;
}

function setGotimeStepUI(state) {
  // Static QR flow: keep UI simple.
  if (state === 'loading') {
    const st = document.getElementById('gotymeStatus');
    if (st) st.innerText = 'Preparing payment...';
    return;
  }

  if (state === 'ready') {
    const st = document.getElementById('gotymeStatus');
    if (st) st.innerText = 'Scan the QR and pay the exact amount.';
    return;
  }

  if (state === 'error') {
    const st = document.getElementById('gotymeStatus');
    if (st) st.innerText = 'Could not create dynamic payment. Please try again.';
    return;
  }
}

function confirmPaid() {
  // Front-end fallback confirmation only.
  alert('If you already paid, your order will be verified via webhook in the next version. For now, we mark it as: Awaiting manual confirmation.');

  cart = [];
  updateCartUI();

  // Reset UI
  const gotymeStep = document.getElementById('gotymeStep');
  if (gotymeStep) gotymeStep.classList.remove('active');

  const checkoutFormWrap = document.getElementById('checkoutFormWrap');
  if (checkoutFormWrap) {
    const form = checkoutFormWrap.querySelector('form');
    if (form) form.style.display = 'block';
  }

  const orderForm = document.getElementById('orderForm');
  if (orderForm) orderForm.reset();

  toggleCart();
}

// Legacy dynamic GoTyme function removed (not used in this manual-invoice workflow).
async function startGoymePaymentStepDynamic() {
  return;
}

async function processCheckout(event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert('Please add items to your cart before submitting an order request.');
    return;
  }

  const name = document.getElementById('fullNameInput')?.value?.trim();
  const email = document.getElementById('emailInput')?.value?.trim();
  const phone = document.getElementById('phoneInput')?.value?.trim();
  const shippingAddress = document.getElementById('addressInput')?.value?.trim();

  const productNames = cart.map((i) => i.name).join(', ');
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const orderId = generateOrderId();

  const order = {
    id: orderId,
    createdAt: new Date().toISOString(),
    customer: { name, email, phone, shippingAddress },
    items: cart,
    productNames,
    total,
    status: 'REQUEST_RECEIVED',
  };

  // Save to localStorage as a simple “database/state” for now.
  const ordersKey = 'pepzy_orders';
  const existing = JSON.parse(localStorage.getItem(ordersKey) || '[]');
  existing.push(order);
  localStorage.setItem(ordersKey, JSON.stringify(existing));

  // Trigger automated confirmation email (non-blocking redirect).
  try {
    await fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, name, email, productNames }),
    });
  } catch (e) {
    console.error('Email trigger failed:', e);
  }

  // Clear cart + UI
  cart = [];
  updateCartUI();
  toggleCart();

  const orderForm = document.getElementById('orderForm');
  if (orderForm) orderForm.reset();

  // Redirect to Thank You page
  window.location.href = 'thank-you.html?id=' + encodeURIComponent(orderId);
}

// Make functions available for inline handlers (onclick / onsubmit)
window.scrollCarousel = scrollCarousel;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartUI = updateCartUI;
window.toggleCart = toggleCart;
window.processCheckout = processCheckout;
window.backToCheckout = backToCheckout;
window.setGotimeStepUI = setGotimeStepUI;
window.confirmPaid = confirmPaid;
window.startGoymePaymentStepDynamic = startGoymePaymentStepDynamic;
window.formatMoneyPHP = formatMoneyPHP;
window.generateOrderId = generateOrderId;

