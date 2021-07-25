import { GetInitialAggregateState } from '../../../../src'

declare global {
  namespace Domain.Cart {
    type State = {
      isPlaced: boolean
    }
  }
}

export const getInitialState: GetInitialAggregateState<Domain.Cart.State> =
  () => ({
    isPlaced: false,
  })
