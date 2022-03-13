import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";
import {GuildMusDataArr} from "../guildMusData";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all commands and their descriptions'),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {
        const str =
            'Play: plays the song from the link (or first result of search phrase) replacing current playing track.\n' +
            'Add: adds song to the queue.\n'+
            'Skip: skips current song.\n' +
            'Loop: loops or stops looping current song.\n' +
            'LoopQueue: loops entire queue.\n' +
            'Pause: pauses playing.\n' +
            'Resume: resumes playing.\n' +
            'Stop: makes bot completely stop playing and exit the voice channel.'
        await interaction.reply({content: str, ephemeral: true});
    }
}
