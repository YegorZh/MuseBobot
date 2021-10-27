import {SlashCommandBuilder} from '@discordjs/builders'
import {CommandInteraction, GuildMember} from "discord.js";
import {
    AudioPlayer,
    AudioResource,
    createAudioPlayer,
    createAudioResource,
    DiscordGatewayAdapterCreator,
    joinVoiceChannel,
    StreamType,
    VoiceConnection
} from "@discordjs/voice";
import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays first found youtube video by keyword or link.')
        .addStringOption(option => option.setName('link').setDescription('Link duh').setRequired(true)),
    async execute(interaction: CommandInteraction) {

        if(!(interaction.member instanceof GuildMember)) return await interaction.reply(`Some dumb error with member type`);
        const member: GuildMember = interaction.member;
        if(member.voice.channel){
            const connection: VoiceConnection = joinVoiceChannel({
                channelId: member.voice.channel.id,
                guildId: member.voice.channel.guild.id,
                adapterCreator: member.voice.channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
            });

            const player: AudioPlayer  = createAudioPlayer();
            connection.subscribe(player);
            player.on('error', error => {
                console.error('Error:', error.message);
            });

            const link = interaction.options.getString('link');
            if(typeof link !== "string") return interaction.reply('Error with given data');
            const resource: AudioResource = createAudioResource(ytdl(link, { filter: 'audioonly', quality: 'highestaudio'}), {
                inputType: StreamType.WebmOpus
            });

             resource.playStream.on('readable', async () =>{
                player.play(resource);
                await interaction.reply(`Playing ${link}`);
            })
        } else { await interaction.reply({ content: 'You must be in a voice channel.', ephemeral: true });}
    }
}