import * as dotenv from "dotenv";
import { config } from "./config";
import { BetterClient } from "./extensions/BetterClient";

dotenv.config();

const client = new BetterClient({
    allowedMentions: { parse: ["users"] },
    restTimeOffset: 10,
    restGlobalRateLimit: 50,
    invalidRequestWarningInterval: 500,
    presence: config.presence,
    intents: config.intents
});

client.login().catch(error => {
    client.logger.error(error);
    client.logger.sentry.captureException(error);
});
