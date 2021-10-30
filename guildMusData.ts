import {
    AudioPlayer, AudioPlayerStatus,
    AudioResource,
    createAudioPlayer,
    createAudioResource,
    StreamType,
    VoiceConnection
} from "@discordjs/voice";
import ytdl from "ytdl-core";
import {CommandInteraction} from "discord.js";

export type GuildMusDataArr = {
    [key: string]: GuildMusData
};
export const guildsMusDataArr: GuildMusDataArr = {};

export class GuildMusData{
    audioPlayer: AudioPlayer;
    songs: string[];

    constructor(player: AudioPlayer, link?: string) {
        this.audioPlayer = player;
        this.songs = [];
        if(link) this.songs.push(link);
    }

    initialise(data: GuildMusDataArr, guildId: string, interaction: CommandInteraction, connection: VoiceConnection) {
        data[guildId].audioPlayer.on('error', error => {
            console.error('Error:', error.message);
        });
        data[guildId].audioPlayer.on(AudioPlayerStatus.Idle, () => {
            if(data[guildId].skip(data, guildId, connection)){
                interaction.followUp(`Playing ${data[guildId].songs[0]}`);
            } else {
                interaction.followUp('Finished playing');
            }
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