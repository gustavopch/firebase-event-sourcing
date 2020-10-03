import { GetInitialAggregateState } from '../../../../../src'

export type ShoppingCartState = {
  isPlaced: boolean
}

export const getInitialState: GetInitialAggregateState<ShoppingCartState> = () => ({
  isPlaced: false,
})
