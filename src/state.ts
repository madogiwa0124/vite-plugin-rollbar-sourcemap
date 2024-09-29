import { Logger } from "./logger";

export const state: { logger: Logger } = {
  logger: new Logger(false, true),
};

export const setLogger = (value: Logger) => {
  state.logger = value;
};
