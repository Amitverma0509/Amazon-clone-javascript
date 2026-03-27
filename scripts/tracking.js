import { getOrders } from '../data/orders.js';
import { getProduct } from '../data/products.js';
import { formatCurrency } from './utils/money.js';

const cart = JSON.parse(localStorage.getItem('cart')) || [];
const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
const cartQty = document.querySelector('.js-cart-quantity');
if (cartQty) {
  cartQty.innerHTML = totalQty;
}

const orders = getOrders();
const grid = document.querySelector('.js-order-tracking');
if (!grid) {
  console.error('❌ .js-orders-grid not found in HTML');
}

if (orders.length === 0) {
  grid.innerHTML = `
    <div style="text-align:center; padding: 60px 20px; font-size: 18px; color: #555;">
      You haven't placed any orders yet.
      <br><br>
      <a href="amazon.html" class="link-primary" style="font-size: 16px;">Start Shopping</a>
    </div>
  `;
} else {
  let ordersHTML = '';

  orders.forEach((order) => {
    const placedDate = new Date(order.placedAt);
    const dateString = placedDate.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    let itemsHTML = '';
    order.items.forEach((item) => {
      const product = getProduct(item.productId);
      if (!product) return;

      const deliveryDate = new Date(item.deliveryDate);
      const deliveryString = deliveryDate.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      });

      itemsHTML += `
        <div class="product-image-container">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-details">
          <div class="product-name">${product.name}</div>
          <div class="product-delivery-date">Arriving: ${deliveryString}</div>
          <div class="product-quantity">Quantity: ${item.quantity}</div>
        </div>
        <div class="product-actions">
          <button class="buy-again-button button-primary js-buy-again"
            data-product-id="${item.productId}">
            <img class="buy-again-icon" src="images/icons/buy-again.png">
            Buy it again
          </button>
          <a class="track-package-button button-secondary"
            href="tracking.html?orderId=${order.id}&productId=${item.productId}">
            Track package
          </a>
        </div>
      `;
    });

    ordersHTML += `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${dateString}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div>$${formatCurrency(order.totalCents)}</div>
            </div>
          </div>
          <div class="order-header-right-section">
            <div class="order-header-label">Order #</div>
            <div>${order.id}</div>
          </div>
        </div>
        <div class="order-details-grid">
          ${itemsHTML}
        </div>
      </div>
    `;
    ordersHTML+= `...`;
  });


  
  grid.innerHTML = ordersHTML;

  document.querySelectorAll('.js-buy-again').forEach((button) => {
    button.addEventListener('click', () => {
      const { productId } = button.dataset;
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existing = storedCart.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity += 1;
      } else {
        storedCart.push({ productId, quantity: 1, deliveryOptionId: '1' });
      }
      localStorage.setItem('cart', JSON.stringify(storedCart));
      window.location.href = 'checkout.html';
    });
  });
}
