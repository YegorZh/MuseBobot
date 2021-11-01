import {SlashCommandBuilder} from '@discordjs/builders'
import {CommandInteraction, GuildChannel, GuildMember} from "discord.js";
import {
    AudioPlayerStatus,
    createAudioPlayer,
    DiscordGatewayAdapterCreator,
    joinVoiceChannel,
    VoiceConnection
} from "@discordjs/voice";
import {defaultErrorCheck, GuildMusData, GuildMusDataArr} from "../guildMusData";



module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays first found youtube video by keyword or link.')
        .addStringOption(option => option.setName('link').setDescription('Link duh').setRequired(true)),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {
        const check = defaultErrorCheck(interaction, data, true);
        if(!check) return;
        const {guildId, voiceChannel: channel} = check;

        const link = interaction.options.getString('link');
        if(typeof link !== "string" || link.search(new RegExp('http(?:s?):\\/\\/(?:www\\.)?youtu(?:be\\.com\\/watch\\?v=|\\.be\\/)([\\w\\-\\_]*)(&(amp;)?‌​[\\w\\?‌​=]*)?')) === -1
        ) return interaction.reply({ content: 'You must enter a youtube video link.', ephemeral: true });

        const connection: VoiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guildId,
            adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });
        
        if(!data[guildId]) {
            data[guildId] = new GuildMusData(createAudioPlayer());
            data[guildId].initialise(data, guildId, interaction, connection);
        }

        let player = data[guildId].audioPlayer;
        connection.subscribe(player);
        data[guildId].songs.push(link);

        if(player.state.status === AudioPlayerStatus.Paused){
            player.unpause();
        }

        if(player.state.status === AudioPlayerStatus.Idle) {
            data[guildId].playSong();
            await interaction.reply(`Playing ${link}`);
        } else await interaction.reply(`Song ${link} added to playlist`);
    }
}