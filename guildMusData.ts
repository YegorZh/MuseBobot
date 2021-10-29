import {AudioPlayer, AudioResource, createAudioResource, StreamType} from "@discordjs/voice";
import ytdl from "ytdl-core";

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

    playSong(){
        const resource: AudioResource = createAudioResource(ytdl(this.songs[0], { filter: 'audioonly', quality: 'highestaudio'}), {
            inputType: StreamType.WebmOpus
        });

        resource.playStream.on('readable', async () =>{
            this.audioPlayer.play(resource);
        })
    }
}