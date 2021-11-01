import * as fs from 'fs';
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from '@discordjs/rest';
import { CommandInteraction } from "discord.js";
import {GuildMusDataArr} from "./guildMusData";
import {Routes} from "discord-api-types";

const { clientId, guildId, token } = require('./botconfig.json');

export interface Command{
    data: SlashCommandBuilder,
    execute: (interaction: CommandInteraction, data?: GuildMusDataArr) => Promise<void>
};

const commands: Command[] = [];
const commandFiles: string[] = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
