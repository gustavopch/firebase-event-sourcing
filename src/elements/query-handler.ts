import { ViewStore } from '../stores/view-store'

export type QueryHandler = (store: ViewStore, ...args: any[]) => any
