import { cart, updateDeliveryOption, removeFromCart, updateQuantity } from '../../data/cart.js';
import { getProduct } from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { deliveryOptions, getDeliveryOption } from '../../data/deliveryOptions.js';
import { renderPaymentSummary } from './paymentSummary.js';

function updateCheckoutCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector('.js-checkout-count').innerHTML =
    `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
}

function deliveryOptionsHTML(matchingProduct, cartItem) {
  let html = '';
  deliveryOptions.forEach((deliveryOption) => {
    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');
    const priceString = deliveryOption.priceCents === 0
      ? 'FREE'
      : `$${formatCurrency(deliveryOption.priceCents)}`;
    const isChecked = deliveryOption.id === cartItem.deliveryOptionId;
    html += `
      <div class="delivery-option js-delivery-option"
        data-product-id="${matchingProduct.id}"
        data-delivery-option-id="${deliveryOption.id}">
        <input type="radio"
          ${isChecked ? 'checked' : ''}
          class="delivery-option-input"
          name="delivery-option-${matchingProduct.id}">
        <div>
          <div class="delivery-option-date">${dateString}</div>
          <div class="delivery-option-price">${priceString} Shipping</div>
        </div>
      </div>
    `;
  });
  return html;
}

export function renderOrderSummary() {
  let checkoutHTML = '';

  cart.forEach((cartItem) => {
    const matchingProduct = getProduct(cartItem.productId);
    if (!matchingProduct) return;

    const deliveryOptionId = cartItem.deliveryOptionId || '1';
    const deliveryOption = getDeliveryOption(deliveryOptionId);
    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');

    checkoutHTML += `
      <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
        <div class="delivery-date">Delivery date: ${dateString}</div>
        <div class="cart-item-details-grid">
          <img class="product-image" src="${matchingProduct.image}" alt="${matchingProduct.name}">
          <div class="cart-item-details">
            <div class="product-name">${matchingProduct.name}</div>
            <div class="product-price">$${formatCurrency(matchingProduct.priceCents)}</div>
            <div class="product-quantity">
              <span>
                Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
              </span>
              <span class="update-quantity-link link-primary js-update-link"
                data-product-id="${matchingProduct.id}">Update</span>
              <input class="quantity-input js-quantity-input-${matchingProduct.id}"
                type="number" min="1" max="99"
                value="${cartItem.quantity}"
                style="display:none; width:50px; margin: 0 8px;">
              <span class="save-quantity-link link-primary js-save-quantity-link"
                data-product-id="${matchingProduct.id}"
                style="display:none;">Save</span>
              <span class="delete-quantity-link link-primary js-delete-link"
                data-product-id="${matchingProduct.id}">Delete</span>
            </div>
          </div>
          <div class="delivery-options">
            <div class="delivery-options-title">Choose a delivery option:</div>
            ${deliveryOptionsHTML(matchingProduct, cartItem)}
          </div>
        </div>
      </div>
    `;
  });

  if (cart.length === 0) {
    checkoutHTML = `
      <div style="padding: 40px; text-align: center; font-size: 18px;">
        Your cart is empty. <a href="amazon.html" class="link-primary">Continue Shopping</a>
      </div>
    `;
  }

  document.querySelector('.js-checkout-grid').innerHTML = checkoutHTML;
  updateCheckoutCount();

  document.querySelectorAll('.js-delete-link').forEach((link) => {
    link.addEventListener('click', () => {
      const { productId } = link.dataset;
      removeFromCart(productId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });

  document.querySelectorAll('.js-update-link').forEach((link) => {
    link.addEventListener('click', () => {
      const { productId } = link.dataset;
      const container = document.querySelector(`.js-cart-item-container-${productId}`);
      container.classList.add('is-editing-quantity');
      const label = container.querySelector(`.js-quantity-label-${productId}`);
      const input = container.querySelector(`.js-quantity-input-${productId}`);
      const saveLink = container.querySelector('.js-save-quantity-link');
      label.style.display = 'none';
      link.style.display = 'none';
      input.style.display = 'inline-block';
      saveLink.style.display = 'inline';
    });
  });

  document.querySelectorAll('.js-save-quantity-link').forEach((link) => {
    link.addEventListener('click', () => {
      const { productId } = link.dataset;
      const input = document.querySelector(`.js-quantity-input-${productId}`);
      const newQuantity = parseInt(input.value);
      if (isNaN(newQuantity) || newQuantity < 1) return;
      updateQuantity(productId, newQuantity);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });

  document.querySelectorAll('.js-delivery-option').forEach((element) => {
    element.addEventListener('click', () => {
      const { productId, deliveryOptionId } = element.dataset;
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });
}
