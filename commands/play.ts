import { SlashCommandBuilder } from '@discordjs/builders'
import {CommandInteraction, Guild, GuildMember, Interaction, InteractionType, VoiceState} from "discord.js";
import {APIInteractionGuildMember} from 'discord-api-types';
import {DiscordGatewayAdapterCreator, joinVoiceChannel, VoiceConnection} from "@discordjs/voice";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays first found youtube video by keyword or link.'),
    async execute(interaction: CommandInteraction) {

        const member: GuildMember | null = interaction.member as GuildMember;
        if(member.voice.channel){
            const connection: VoiceConnection = joinVoiceChannel({
                channelId: member.voice.channel.id,
                guildId: member.voice.channel.guild.id,
                adapterCreator: member.voice.channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
            });
        }

        await interaction.reply('Pong!');
    }
}