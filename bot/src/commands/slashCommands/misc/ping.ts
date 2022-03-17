import { CommandInteraction, Message } from "discord.js";
import { SlashCommand } from "~/classes/SlashCommand";
import { BetterClient } from "~/extensions/BetterClient";

export class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("ping", client, {
            description: `Pong! Get the current ping / latency of ${client.config.botName}.`
        });
    }

    override async run(interaction: CommandInteraction) {
        const message = (await interaction.editReply({
            content: "Ping?"
        })) as Message;
        const hostLatency =
            message.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(this.client.ws.ping);
        return interaction.editReply({
            content: `Pong! Round trip took ${(
                hostLatency + apiLatency
            ).toLocaleString()}ms. (Host latency is ${hostLatency.toLocaleString()} and API latency is ${apiLatency.toLocaleString()}ms)`
        });
    }
}
