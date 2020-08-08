import { ContextDefinition } from './context-definition'

export type DomainDefinition = {
  [contextName: string]: ContextDefinition
}
