import { getProduct } from "./products.js";
import { getDeliveryOption } from "./deliveryOptions.js";

export function getOrders() {
  return JSON.parse(localStorage.getItem('orders')) || [];
}

export function saveOrder(cart) {
  const orders = getOrders();

  const items = cart.map((cartItem)=>{
    const product = getProduct(cartItem.productId);
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryOption.deliveryDays);

    return {
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      deliveryOptionId: cartItem.deliveryOptionId,
      deliveryDate: deliveryDate.toISOString(),
      priceCents: product.priceCents
    }
  })

  const totalCents = items.reduce((sum,item)=>{
    const deliveryOption = getDeliveryOption(item.deliveryOptionId);
    return sum + (item.priceCents * item.quantity) + deliveryOption.priceCents;
  },0);

  const order = {
    id: 'order-'+ Date.now(),
    placedAt: new Date().toISOString(),
    items,
    totalCents: Math.round(totalCents * 1.1)
  };

  orders.unshift(order);
  localStorage.setItem('orders',JSON.stringify(orders));
  return order;
}