import { FlowService } from '../services/flow-service'

export type CronHandler = (flow: FlowService) => Promise<void>
