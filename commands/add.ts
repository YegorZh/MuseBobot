import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";
import {defaultErrorCheck, GuildMusDataArr, guildSkip} from "../guildMusData";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adds song to the playlist')
        .addStringOption(option => option.setName('link').setDescription('Link duh').setRequired(true)),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {
        const check = defaultErrorCheck(interaction, data);
        if(!check) return;
        const {guildId} = check;

        const link = interaction.options.getString('link');
        if(typeof link !== "string" || link.search(new RegExp('http(?:s?):\\/\\/(?:www\\.)?youtu(?:be\\.com\\/watch\\?v=|\\.be\\/)([\\w\\-\\_]*)(&(amp;)?‌​[\\w\\?‌​=]*)?')) === -1
        ) return interaction.reply({ content: 'You must enter a youtube video link.', ephemeral: true });

        data[guildId].songs.push(link);
        await interaction.reply(`Song ${link} was added to playlist`);
    }
}