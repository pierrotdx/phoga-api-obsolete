export interface LoggerInterface {
  info: (message: string, meta?: LogData) => void;
  warn: (message: string, meta?: LogData) => void;
  error: (err: unknown) => void;
}

export interface LogData {
  [optionName: string]: any;
}
