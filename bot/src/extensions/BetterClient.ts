import { resolve } from "path";
import * as metrics from "datadog-metrics";
import { Client, ClientOptions, Collection } from "discord.js";
import { Button } from "~/classes/Button";
import { DropDown } from "~/classes/DropDown";
import { Logger } from "~/classes/Logger";
import { Functions } from "~/utilities/functions";
import { TextCommand } from "~/classes/TextCommand";
import { EventHandler } from "~/classes/EventHandler";
import { SlashCommand } from "~/classes/SlashCommand";
import { ButtonHandler } from "~/classes/ButtonHandler";
import { TextCommandHandler } from "../classes/TextCommandHandler";
import { SlashCommandHandler } from "../classes/SlashCommandHandler";
import { AutoCompleteHandler } from "../classes/AutoCompleteHandler";
import { AutoComplete } from "../classes/AutoComplete";
import { DropdownHandler } from "~/classes/DropDownHandler";
import { CachedStats, Stats } from "~/typings";
import { config } from "~/config";

export class BetterClient extends Client {
    /**
     * A set of users that are currently using the bot.
     */
    public usersUsingBot: Set<string>;

    /**
     * The config for our client.
     */
    public readonly config;

    /**
     * The functions for our client.
     */
    public readonly functions: Functions;

    /**
     * The logger for our client.
     */
    public readonly logger: Logger;

    /**
     * The slashCommandHandler for our client.
     */
    public readonly slashCommandHandler: SlashCommandHandler;

    /**
     * The slashCommands for our client.
     */
    public slashCommands: Collection<string, SlashCommand>;

    /**
     * The textCommandHandler for our client.
     */
    public readonly textCommandHandler: TextCommandHandler;

    /**
     * The textCommands for our client.
     */
    public textCommands: Collection<string, TextCommand>;

    /**
     * The buttonHandler for our client.
     */
    public readonly buttonHandler: ButtonHandler;

    /**
     * The buttons for our client.
     */
    public buttons: Collection<string, Button>;

    /**
     * The dropDownHandler for our client.
     */
    public readonly dropDownHandler: DropdownHandler;

    /**
     * The dropDowns for our client.
     */
    public dropDowns: Collection<string, DropDown>;

    /**
     * The autoCompleteHandler for our client.
     */
    public readonly autoCompleteHandler: AutoCompleteHandler;

    /**
     * The autoCompletes for our client.
     */
    public autoCompletes: Collection<string, AutoComplete>;

    /**
     * The events for our client.
     */
    public events: Map<string, EventHandler>;

    /**
     * Our data dog client.
     */
    public readonly dataDog: typeof metrics;

    /**
     * The current version of our client.
     */
    public readonly version: string;

    /**
     * Our client's stats.
     */
    public stats: Stats;

    /**
     * Our client's cached stats.
     */
    public cachedStats: CachedStats;

    /**
     * __dirname is not in our version of ECMA, so we make do with a shitty fix.
     */
    public readonly __dirname: string;

    /**
     * Create our client.
     * @param options The options for our client.
     */
    constructor(options: ClientOptions) {
        super(options);

        this.__dirname = resolve();

        this.usersUsingBot = new Set();
        this.config = config;
        this.functions = new Functions(this);
        this.logger = new Logger();

        this.slashCommandHandler = new SlashCommandHandler(this);
        this.slashCommands = new Collection();

        this.textCommandHandler = new TextCommandHandler(this);
        this.textCommands = new Collection();

        this.buttonHandler = new ButtonHandler(this);
        this.buttons = new Collection();

        this.dropDownHandler = new DropdownHandler(this);
        this.dropDowns = new Collection();

        this.autoCompleteHandler = new AutoCompleteHandler(this);
        this.autoCompletes = new Collection();

        this.events = new Map();

        this.version =
            process.env.NODE_ENV === "development"
                ? `${this.config.version}-dev`
                : this.config.version;

        this.stats = {
            messageCount: 0,
            commandsRun: 0
        };

        this.cachedStats = {
            guilds: 0,
            users: 0,
            cachedUsers: 0,
            channels: 0,
            roles: 0
        };

        this.dropDownHandler.loadDropDowns();
        this.buttonHandler.loadButtons();
        this.slashCommandHandler.loadSlashCommands();
        this.textCommandHandler.loadTextCommands();
        this.autoCompleteHandler.loadAutoCompletes();
        this.loadEvents();

        // @ts-ignore
        this.dataDog = metrics.default;
        if (this.config.dataDog.apiKey?.length) {
            this.dataDog.init({
                flushIntervalSeconds: 0,
                apiKey: this.config.dataDog.apiKey,
                prefix: `${this.config.botName}.`,
                defaultTags: [`env:${process.env.NODE_ENV}`]
            });

            setInterval(() => {
                this.dataDog.gauge("guilds", this.cachedStats.guilds);
                this.dataDog.gauge("users", this.cachedStats.users);
                if (this.isReady())
                    this.dataDog.flush(
                        () =>
                            this.logger.info(`Flushed information to DataDog.`),
                        error => {
                            this.logger.error(error);
                            this.logger.sentry.captureException(error);
                        }
                    );
            }, 10000);
        }
    }

    /**
     * login to Discord.
     */
    override async login() {
        return super.login();
    }

    /**
     * Load all the events in the events directory.
     */
    private loadEvents() {
        return this.functions
            .getFiles(`${this.__dirname}/dist/src/bot/events`, ".js", true)
            .forEach(async eventFileName => {
                const eventFile = await import(
                    `./../../src/bot/events/${eventFileName}`
                );
                // eslint-disable-next-line new-cap
                const event: EventHandler = new eventFile.default(
                    this,
                    eventFileName.split(".js")[0]
                );
                event.listen();
                return this.events.set(event.name, event);
            });
    }

    /**
     * Reload all the events in the events directory.
     */
    public reloadEvents() {
        this.events.forEach(event => event.removeListener());
        this.loadEvents();
    }

    /**
     * Fetch all the stats for our client.
     */
    public async fetchStats() {
        const stats = await this.shard?.broadcastEval(client => {
            return {
                guilds: client.guilds.cache.size,
                users: client.guilds.cache.reduce(
                    (previous, guild) => previous + (guild.memberCount ?? 0),
                    0
                ),
                cachedUsers: client.users.cache.size,
                channels: client.channels.cache.size,
                roles: client.guilds.cache.reduce(
                    (previous, guild) => previous + guild.roles.cache.size,
                    0
                )
            };
        });

        const reducedStats = stats?.reduce((previous, current) => {
            Object.keys(current).forEach(
                // @ts-ignore
                key => (previous[key] += current[key])
            );
            return previous;
        });
        this.cachedStats = reducedStats || this.cachedStats;
        return reducedStats || this.cachedStats;
    }
}
