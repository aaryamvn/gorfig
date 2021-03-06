import { EventHandler } from "~/classes/EventHandler.js";

export class ShardResume extends EventHandler {
    override async run(shardId: number, replayedEvents: number) {
        this.client.logger.info(
            `Shard ${shardId} resumed and replayed ${replayedEvents} events!`
        );
    }
}
