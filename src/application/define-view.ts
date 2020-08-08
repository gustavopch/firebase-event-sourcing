import { ViewDefinition } from './definitions/view-definition'

export const defineView = <TViewDefinition extends ViewDefinition>(
  view: TViewDefinition,
) => {
  return view
}
