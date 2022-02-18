import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";
import {checkLink, defaultErrorCheck, GuildMusDataArr, guildSkip} from "../guildMusData";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adds song to the playlist')
        .addStringOption(option => option.setName('link').setDescription('Link or search phrase').setRequired(true)),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {
        const check = defaultErrorCheck(interaction, data);
        if (!check) return;
        const {guildId} = check;

        let link: string | string[] = interaction.options.getString('link') as string;
        link = await checkLink(link, interaction);
        if (!link) return;

        if (typeof link === 'string') {
            data[guildId].songs.push(link);
            return await interaction.reply(`Song ${link} was added to playlist`);
        } else {
            for(let url of link) data[guildId].songs.push(url);
            return await interaction.reply(`Playlist ${interaction.options.getString('link')} was added to the end of the queue.`);
        }


    }
}