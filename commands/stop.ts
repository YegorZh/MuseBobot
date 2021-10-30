import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";
import {defaultErrorCheck, GuildMusDataArr, guildSkip} from "../guildMusData";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Completely stops the bot and exits the voice channel'),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {
        const check = defaultErrorCheck(interaction, data);
        if(!check) return;
        const {guildId, connection} = check;
        data[guildId].destroy(data, guildId, connection);
        await interaction.reply('Stopped playing');
    }
}