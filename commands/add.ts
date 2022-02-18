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
        if(!check) return;
        const {guildId} = check;

        let link = interaction.options.getString('link') as string;
        link = await checkLink(link, interaction) as string;

        data[guildId].songs.push(link);
        await interaction.reply(`Song ${link} was added to playlist`);
    }
}