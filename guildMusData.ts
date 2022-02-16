import {
    AudioPlayer, AudioPlayerStatus,
    AudioResource,
    createAudioResource, demuxProbe, getVoiceConnection,
    StreamType,
    VoiceConnection
} from "@discordjs/voice";

const youtubedl = require('youtube-dl-exec')
import {CommandInteraction, GuildChannel, GuildMember} from "discord.js";
import ytdl from 'ytdl-core';
import {Track} from "./track";
import * as stream from "stream";

export async function guildSkip(interaction: CommandInteraction, data: GuildMusDataArr, guildId: string, connection: VoiceConnection) {
    let str: string;
    if (data[guildId].skip(data, guildId, connection)) {
        str = `Playing ${data[guildId].songs[0]}`;
        if (interaction.replied) return await interaction.channel?.send(str);
        return await interaction.reply(str);
    } else {
        str = 'Finished playing';

        if (interaction.replied) return await interaction.channel?.send(str);
        return await interaction.reply(str);
    }
}

export function defaultErrorCheck(interaction: CommandInteraction, data: GuildMusDataArr, short: boolean = false) {
    function reply(str: string) {
        interaction.reply({content: str, ephemeral: true});
        return null;
    }

    const textChannel = interaction.channel;
    if (!textChannel) return reply('Some dumb error with text channel, try another one');

    if (!(interaction.guild?.me?.permissionsIn(textChannel as GuildChannel).has(["SEND_MESSAGES", "VIEW_CHANNEL"])))
        return reply('Bot has no permissions in this text channel.');

    const member = interaction.member;
    if (!(member instanceof GuildMember)) return reply('Some dumb error with missing user i dunno.');

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) return reply('You must be in a voice channel with the bot.');

    if (!(interaction.guild?.me?.permissionsIn(voiceChannel as GuildChannel)).has(["SPEAK", "CONNECT"]))
        return reply('Bot has no permissions in your voice channel');

    const guildId = voiceChannel.guildId;
    if (short) return {guildId, voiceChannel};

    const connection = getVoiceConnection(guildId);
    if (connection?.joinConfig.channelId !== member.voice.channel?.id) return reply('You must be in a voice channel with the bot.');
    if (!data[guildId] || !connection) return reply('You must be in a voice channel with the bot.');

    return {member, guildId, connection, voiceChannel};
}

export type GuildMusDataArr = {
    [key: string]: GuildMusData
};
export const guildsMusDataArr: GuildMusDataArr = {};

export class GuildMusData {
    audioPlayer: AudioPlayer;
    songs: string[];
    loop: boolean;

    constructor(player: AudioPlayer, link?: string) {
        this.audioPlayer = player;
        this.songs = [];
        this.loop = false;
        if (link) this.songs.push(link);
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

    playSong() {
        Track.from(this.songs[0]).then(stream => {
            stream.createAudioResource().then(resource => {
                resource.playStream.on('readable', async () => {
                    this.audioPlayer.play(resource);
            });
        });
        });

        // ytdl.getInfo(this.songs[0]).then((info) => {
        //     const resource: AudioResource = createAudioResource(ytdl.downloadFromInfo(info, {highWaterMark: 1<<25, quality: 'highestaudio', filter: 'audioonly', requestOptions:
        //             {maxReconnects: 24,
        //             maxRetries: 12,
        //             backoff: { inc: 500, max: 10000 }}}), {
        //         inputType: StreamType.WebmOpus
        //     });
        //     resource.playStream.on('readable', async () => {
        //         this.audioPlayer.play(resource);
        //     });
        // });


        // youtubedl(this.songs[0], {f: '249', dumpJson: true}).then((output: any) => {
        //         const req = https.get(output.url,  (response) => {
        //             if (response.statusCode === 200) {
        //                 const resource: AudioResource = createAudioResource(response, {
        //                     inputType: StreamType.WebmOpus
        //                 });
        //                 resource.playStream.on('readable', async () => {
        //                     this.audioPlayer.play(resource);
        //                 });
        //             }
        //         })
        //         req.on('error', function (e) {
        //             console.log(e);
        //         });
        //         req.on('timeout', function () {
        //             console.log('timeout');
        //             req.destroy();
        //         });
        //     }
        // );
    }

    skip(data: GuildMusDataArr, guildId: string, connection: VoiceConnection): boolean {
        this.songs.shift();
        if (this.songs.length > 0) {
            this.playSong();
            return true;
        } else {
            this.destroy(data, guildId, connection)
            return false;
        }
    }

    destroy(data: GuildMusDataArr, guildId: string, connection: VoiceConnection) {
        this.audioPlayer.stop();
        delete data[guildId];
        connection.destroy();
    }
}