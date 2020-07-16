import { FlowManager } from '../services/flow-manager'

export type CronHandler = (manager: FlowManager) => Promise<void>
