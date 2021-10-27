import { SlashCommandBuilder } from '@discordjs/builders'
import {CommandInteraction, Interaction, InteractionType} from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays music from a link or '),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!');
    }
}