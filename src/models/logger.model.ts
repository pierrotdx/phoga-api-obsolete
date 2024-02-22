export interface LoggerInterface {
  info: (message: string, meta?: LogData) => void;
  warn: (message: string, meta?: LogData) => void;
  error: (err: Error) => void;
}

export interface LogData {
  [optionName: string]: any;
}
