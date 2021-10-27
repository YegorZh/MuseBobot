import { SlashCommandBuilder } from '@discordjs/builders'
import {CommandInteraction, Interaction, InteractionType} from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!');
    }
}