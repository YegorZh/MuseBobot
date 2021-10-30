import { SlashCommandBuilder } from '@discordjs/builders'
import {CommandInteraction, GuildMember} from "discord.js";


module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),
    async execute(interaction: CommandInteraction) {

    }
}