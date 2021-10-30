import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";
import {defaultErrorCheck, GuildMusDataArr, guildSkip} from "../guildMusData";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses current song'),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {
        const check = defaultErrorCheck(interaction, data);
        if(!check) return;
        const {guildId} = check;
        data[guildId].audioPlayer.pause();
        await interaction.reply('Song\'s paused');
    }
}