import { Logging } from '@google-cloud/logging'
import { Request } from 'express'

import { generateId } from '../utils/generate-id'

export type LogSeverity = 'debug' | 'info' | 'warn' | 'error'

type LogOptions = {
  timestamp?: Date
  labels?: { [key: string]: string | number | boolean }
}

type LogFn = (
  scope: string,
  message: string,
  body?: any,
  options?: LogOptions,
) => void

export type LoggerService = {
  debug: LogFn
  info: LogFn
  warn: LogFn
  error: LogFn
}

export const createLoggerService = (req: Request | null): LoggerService => {
  const logging = new Logging()
  const log = logging.log('global')

  const writeLogEntry = async <TBody>(
    severity: LogSeverity,
    scope: string,
    message: string,
    body?: TBody,
    options?: LogOptions,
  ) => {
    const timestamp = options?.timestamp ?? new Date()

    await log.write(
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
  }
}
