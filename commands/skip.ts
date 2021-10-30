import { SlashCommandBuilder } from '@discordjs/builders'
import {CommandInteraction, Guild, GuildMember} from "discord.js";
import {GuildMusDataArr, guildSkip} from "../guildMusData";
import {getVoiceConnection, VoiceConnection} from "@discordjs/voice";



module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips current track'),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {
        const member = interaction.member;
        if(!(member instanceof GuildMember)) return await interaction.reply({ content: 'Some dumb error with missing user i dunno.', ephemeral: true });

        const guildId = member.voice.channel?.guild.id;
        if(!guildId) return await interaction.reply({ content: 'You must be in a voice channel with the bot.', ephemeral: true });

        const connection = getVoiceConnection(guildId);
        if(connection?.joinConfig.channelId !== member.voice.channel?.id)
            return await interaction.reply({ content: 'You must be in a voice channel with the bot.', ephemeral: true });

        if(!data[guildId] || !connection) return await interaction.reply({content: 'Bot isn\'t playing any songs'});
        await guildSkip(interaction, data, guildId, connection);
    }
}