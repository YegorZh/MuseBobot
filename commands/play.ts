import {SlashCommandBuilder} from '@discordjs/builders'
import {CommandInteraction, GuildMember} from "discord.js";
import {
    AudioPlayerStatus,
    createAudioPlayer,
    DiscordGatewayAdapterCreator,
    joinVoiceChannel,
    VoiceConnection
} from "@discordjs/voice";
import {GuildMusData, GuildMusDataArr} from "../guildMusData";



module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays first found youtube video by keyword or link.')
        .addStringOption(option => option.setName('link').setDescription('Link duh').setRequired(true)),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {

        const member = interaction.member;
        if(!(member instanceof GuildMember)) return await interaction.reply({ content: 'Some dumb error with member type', ephemeral: true });

        const channel = member.voice.channel;
        if(!channel) return await interaction.reply({ content: 'You must be in a voice channel.', ephemeral: true });

        const link = interaction.options.getString('link');
        if(typeof link !== "string") return interaction.reply({ content: 'You must enter a link.', ephemeral: true });

        const guildId = channel.guild.id;
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