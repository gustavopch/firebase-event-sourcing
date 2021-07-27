import { Logging } from '@google-cloud/logging'
import { Request } from 'express'

import { generateId } from '../utils/generate-id'

export type LogSeverity = 'debug' | 'info' | 'warn' | 'error'

export type LoggerService = ReturnType<typeof createLoggerService>

export const createLoggerService = (req: Request | null) => {
  const logging = new Logging()
  const log = logging.log('global')

  const writeLogEntry = <TBody>(
    severity: LogSeverity,
    scope: string,
    message: string,
    body?: TBody,
    options?: {
      timestamp?: Date
      labels?: { [key: string]: string | number | boolean }
    },
  ) => {
    const timestamp = options?.timestamp ?? new Date()

    void log.write(
      // Docs: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
      log.entry(
        {
          timestamp,
          httpRequest: {
            remoteIp: req?.ip,
            userAgent: req?.header('User-Agent'),
          },
          labels: {
            ...options?.labels,
            scope,
            reqId: generateId(),
            userId: req?.userId ?? 'unknown',
          },
          resource: {
            type: 'global',
          },
          severity: {
            debug: 'DEBUG',
            info: 'INFO',
            warn: 'WARNING',
            error: 'ERROR',
          }[severity],
        },
        {
          message,
          data: body,
        },
      ),
    )
  }

  return {
    debug: writeLogEntry.bind(null, 'debug'),
    info: writeLogEntry.bind(null, 'info'),
    warn: writeLogEntry.bind(null, 'warn'),
    error: writeLogEntry.bind(null, 'error'),

    withScope: (scope: string) => ({
      debug: writeLogEntry.bind(null, 'debug', scope),
      info: writeLogEntry.bind(null, 'info', scope),
      warn: writeLogEntry.bind(null, 'warn', scope),
      error: writeLogEntry.bind(null, 'error', scope),
    }),
  }
}
