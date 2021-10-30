import {
    AudioPlayer, AudioPlayerStatus,
    AudioResource,
    createAudioResource, getVoiceConnection,
    StreamType,
    VoiceConnection
} from "@discordjs/voice";
import ytdl from "ytdl-core";
import {CommandInteraction, GuildMember} from "discord.js";

export async function guildSkip(interaction: CommandInteraction, data: GuildMusDataArr, guildId: string, connection: VoiceConnection){
    let str: string;
    if(data[guildId].skip(data, guildId, connection)){
        str = `Playing ${data[guildId].songs[0]}`;

        if(interaction.replied) return await interaction.followUp(str);
        return await interaction.reply(str);
    } else {
        str = 'Finished playing';

        if(interaction.replied) return await interaction.followUp(str);
        return await interaction.reply(str);
    }
}

export function defaultErrorCheck(interaction: CommandInteraction, data: GuildMusDataArr){
    const member = interaction.member;
    if(!(member instanceof GuildMember)) {
        interaction.reply({ content: 'Some dumb error with missing user i dunno.', ephemeral: true });
        return null;
    }

    const guildId = member.voice.channel?.guild.id;
    if(!guildId) {
        interaction.reply({ content: 'You must be in a voice channel with the bot.', ephemeral: true });
        return null;
    }

    const connection = getVoiceConnection(guildId);
    if(connection?.joinConfig.channelId !== member.voice.channel?.id){
        interaction.reply({ content: 'You must be in a voice channel with the bot.', ephemeral: true });
        return null;
    }

    if(!data[guildId] || !connection) {
        interaction.reply({content: 'Bot isn\'t playing any songs'});
        return null;
    }

    return {member, guildId, connection};
}

export type GuildMusDataArr = {
    [key: string]: GuildMusData
};
export const guildsMusDataArr: GuildMusDataArr = {};

export class GuildMusData{
    audioPlayer: AudioPlayer;
    songs: string[];
    loop: boolean;

    constructor(player: AudioPlayer, link?: string) {
        this.audioPlayer = player;
        this.songs = [];
        this.loop = false;
        if(link) this.songs.push(link);
    }

    initialise(data: GuildMusDataArr, guildId: string, interaction: CommandInteraction, connection: VoiceConnection) {
        data[guildId].audioPlayer.on('error', error => {
            console.error('Error:', error.message);
        });
        data[guildId].audioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.loop ? this.playSong() :
                guildSkip(interaction, data, guildId, connection);
        });
    }

    playSong(){
        const resource: AudioResource = createAudioResource(ytdl(this.songs[0], { filter: 'audioonly', quality: 'highestaudio'}), {
            inputType: StreamType.WebmOpus
        });

        resource.playStream.on('readable', async () =>{
            this.audioPlayer.play(resource);
        })
    }

    skip(data: GuildMusDataArr, guildId: string, connection: VoiceConnection): boolean{
        this.songs.shift();
        if(this.songs.length > 0){
            this.playSong();
            return true;
        }
        else {
            this.destroy(data, guildId, connection)
            return false;
        }
    }

    destroy(data: GuildMusDataArr, guildId: string, connection: VoiceConnection){
        this.audioPlayer.stop();
        delete data[guildId];
        connection.destroy();
    }
}