import { FlowDefinition } from './definitions/flow-definition'

export const defineFlow = <TFlowDefinition extends FlowDefinition>(
  flow: TFlowDefinition,
) => {
  return flow
}
