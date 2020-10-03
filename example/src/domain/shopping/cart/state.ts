import { GetInitialAggregateState } from '../../../../../src'

export type State = {
  isPlaced: boolean
}

export const getInitialState: GetInitialAggregateState<State> = () => ({
  isPlaced: false,
})
