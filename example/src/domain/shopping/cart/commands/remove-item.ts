import {
  SHOPPING_CART_ITEM_REMOVED,
  ShoppingCartItemRemoved,
} from '../events/item-removed'

export const removeItem = (data: ShoppingCartItemRemoved['data']) => ({
  name: SHOPPING_CART_ITEM_REMOVED,
  data,
})
