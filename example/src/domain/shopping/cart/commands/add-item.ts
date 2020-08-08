import {
  SHOPPING_CART_ITEM_ADDED,
  ShoppingCartItemAdded,
} from '../events/item-added'

export const addItem = (data: ShoppingCartItemAdded['data']) => ({
  name: SHOPPING_CART_ITEM_ADDED,
  data,
})
