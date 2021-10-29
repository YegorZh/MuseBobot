import {SlashCommandBuilder} from '@discordjs/builders'
import {CommandInteraction, GuildMember} from "discord.js";
import {
    AudioPlayerStatus,
    AudioResource,
    createAudioPlayer,
    createAudioResource,
    DiscordGatewayAdapterCreator,
    joinVoiceChannel,
    StreamType,
    VoiceConnection
} from "@discordjs/voice";
import ytdl from "ytdl-core";
import {ServerData, ServerDataArr} from "../index";

function playSong(interaction: CommandInteraction, servData: ServerData, ){
    const resource: AudioResource = createAudioResource(ytdl(servData.songs[0], { filter: 'audioonly', quality: 'highestaudio'}), {
        inputType: StreamType.WebmOpus
    });
    resource.playStream.on('readable', async () =>{
        servData.audioPlayer.play(resource);
    })
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays first found youtube video by keyword or link.')
        .addStringOption(option => option.setName('link').setDescription('Link duh').setRequired(true)),
    async execute(interaction: CommandInteraction, data: ServerDataArr) {

        const member = interaction.member;
        if(!(member instanceof GuildMember)) return await interaction.reply({ content: 'Some dumb error with member type', ephemeral: true });

        const channel = member.voice.channel;
        if(!channel) return await interaction.reply({ content: 'You must be in a voice channel.', ephemeral: true });

        const link = interaction.options.getString('link');
        if(typeof link !== "string") return interaction.reply({ content: 'You must enter a link or a keyword.', ephemeral: true });

        const guildId = channel.guild.id;
        const connection: VoiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guildId,
            adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });
        
        if(!data[guildId]){
            data[guildId] = {
                audioPlayer: createAudioPlayer(),
                songs: []
            };
            data[guildId].audioPlayer.on('error', error => {
                console.error('Error:', error.message);
            });
            data[guildId].audioPlayer.on(AudioPlayerStatus.Idle, () => {
                data[guildId].songs.shift();
                if(data[guildId].songs.length > 0){
                    playSong(interaction, data[guildId]);
                    interaction.followUp(`Playing ${data[guildId].songs[0]}`);
                }
                else {
                    interaction.followUp('Finished playing');
                    data[guildId].audioPlayer.stop();
                    delete data[guildId];
                    connection.destroy();
                }
            });
        }

        let player = data[guildId].audioPlayer;
        connection.subscribe(player);
        data[guildId].songs.push(link);

        if(player.state.status === AudioPlayerStatus.Paused){
            player.unpause();
        }

        if(player.state.status === AudioPlayerStatus.Idle) {
            playSong(interaction, data[guildId]);
            await interaction.reply(`Playing ${link}`);
        } else await interaction.reply(`Song ${link} added to playlist`);
    }
}