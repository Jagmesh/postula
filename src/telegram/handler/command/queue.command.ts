import { Context } from "telegraf";
import { Scheduler } from "../../../scheduler/scheduler.js";
import Logger from "jblog";

const log = new Logger({ scopes: ["/queue"] });

export async function commandQueue(
  ctx: Context,
  scheduler: Scheduler,
): Promise<void> {
  log.info("Processing queue...");
  await scheduler.process();
  return log.info("Finished processing queue");
}
