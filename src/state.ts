import { Logger } from "./logger";

export const state: { logger: Logger } = {
  logger: new Logger(false, true),
};
