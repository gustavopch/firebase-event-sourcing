import {
  SHOPPING_CART_ORDER_PLACED,
  ShoppingCartOrderPlaced,
} from '../events/order-placed'

export const placeOrder = (data: ShoppingCartOrderPlaced['data']) => ({
  name: SHOPPING_CART_ORDER_PLACED,
  data,
})
