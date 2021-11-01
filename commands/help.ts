import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";
import {GuildMusDataArr} from "../guildMusData";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all commands and their descriptions'),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {
        const str =
            'Play - plays the song from the link replacing current playing track.\n' +
            'Add - adds song to the playlist.\n'+
            'Skip - skips current song.\n' +
            'Loop - loops or stops looping current song.\n' +
            'Pause - pauses playing.\n' +
            'Resume - resumes playing.\n' +
            'Stop - makes bot to completely stop playing and exit the voice channel.'
        await interaction.reply({content: str, ephemeral: true});
    }
}