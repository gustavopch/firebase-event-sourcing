import { ViewDefinition } from './definitions/view-definition'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const defineView = <TViewDefinition extends ViewDefinition>(
  view: TViewDefinition,
) => {
  return view
}
