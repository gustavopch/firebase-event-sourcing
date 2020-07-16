import { FlowDefinition } from './definitions/flow-definition'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const defineFlow = <TFlowDefinition extends FlowDefinition>(
  flow: TFlowDefinition,
) => {
  return flow
}
