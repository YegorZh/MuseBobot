import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";
import {defaultErrorCheck, GuildMusDataArr} from "../guildMusData";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Unpauses current song'),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {
        const check = defaultErrorCheck(interaction, data);
        if(!check) return;
        const {guildId} = check;
        data[guildId].audioPlayer.unpause();
        await interaction.reply('Song\'s unpaused');
    }
}