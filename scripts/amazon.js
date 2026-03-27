import { cart, addToCart } from '../data/cart.js';
import { products } from '../data/products.js';
import { formatCurrency } from './utils/money.js';

function renderProducts(productList) {
  let productsHTML = '';
  productList.forEach((product) => {
    productsHTML += `
      <div class="product-container">
        <div class="product-image-container">
          <img src="${product.image}" alt="${product.name}" class="product-image">
        </div>
        <div class="product-name limit-text-to-2-lines">${product.name}</div>
        <div class="product-rating-container">
          <img src="images/ratings/rating-${product.rating.stars * 10}.png" class="product-rating-stars">
          <div class="product-rating--count link-primary">${product.rating.count}</div>
        </div>
        <div class="product-price">$${formatCurrency(product.priceCents)}</div>
        <div class="product-quantity-container">
          <select class="js-quantity-selector-${product.id}">
            ${[1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}">${n}</option>`).join('')}
          </select>
        </div>
        <div class="product-spacer"></div>
        <div class="added-to-cart js-added-to-cart-${product.id}">
          <img src="images/icons/checkmark.png" class="cart-icon"> Added
        </div>
        <button class="add-to-cart-button button-primary js-add-to-cart"
          data-product-id="${product.id}">Add to Cart</button>
      </div>
    `;
  });
  document.querySelector('.js-products-grid').innerHTML = productsHTML;
  attachAddToCartListeners();
}

function updateCartQuantity() {
  let totalQuantity = 0;
  cart.forEach((cartItem) => { totalQuantity += cartItem.quantity; });
  document.querySelector('.js-cart-quantity').innerHTML = totalQuantity;
}

function attachAddToCartListeners() {
  const timeouts = {};

  document.querySelectorAll('.js-add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      const selector = document.querySelector(`.js-quantity-selector-${productId}`);
      const quantity = Number(selector.value);
      addToCart(productId, quantity);
      updateCartQuantity();
      showAddedMessage(productId, timeouts);
    });
  });
}

function showAddedMessage(productId, timeouts) {
  const message = document.querySelector(`.js-added-to-cart-${productId}`);
  message.classList.add('show');

  if (timeouts[productId]) {
    clearTimeout(timeouts[productId]);
  }

  timeouts[productId] = setTimeout(() => {
    message.classList.remove('show');
    delete timeouts[productId];
  }, 2000);
}


renderProducts(products);
updateCartQuantity();
