import {
  SHOPPING_CART_INITIALIZED,
  ShoppingCartInitialized,
} from '../events/initialized'

export const initialize = (data: ShoppingCartInitialized['data']) => ({
  name: SHOPPING_CART_INITIALIZED,
  data,
})
