import * as fs from 'fs';
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from '@discordjs/rest';
import { CommandInteraction } from "discord.js";
import {GuildMusDataArr} from "./guildMusData";
import {Routes} from "discord-api-types/v9";
require('dotenv').config();
const prodToken: string = process.env.PRODTOKEN as string;
const prodID: string = process.env.PRODID as string;
const token: string = process.env.TOKEN as string;
const clientId: string = process.env.CLIENTID as string;
const guildId: string = process.env.GUILDID as string;

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

rest.put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
