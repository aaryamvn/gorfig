// eslint-disable-next-line import/no-extraneous-dependencies
import { GatewayDispatchPayload } from "discord-api-types/v10";
import { EventHandler } from "~/classes/EventHandler";

export class Raw extends EventHandler {
    override async run(event: GatewayDispatchPayload) {
        this.client.dataDog.increment("events", 1, [`event:${event.t}`]);
    }
}
