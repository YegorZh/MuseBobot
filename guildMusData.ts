import {
    AudioPlayer, AudioPlayerStatus,
    AudioResource,
    createAudioResource, demuxProbe, getVoiceConnection,
    StreamType,
    VoiceConnection
} from "@discordjs/voice";

const youtubedl = require('youtube-dl-exec')
import { CommandInteraction, GuildChannel, GuildMember } from "discord.js";
import ytdl from 'ytdl-core';
import { Track } from "./track";
import * as stream from "stream";
import { Command } from "./deploy-commands";
const ytpl = require('ytpl');
const yts = require('ytsr');

export async function guildSkip(interaction: CommandInteraction, data: GuildMusDataArr, guildId: string, connection: VoiceConnection) {
    let str: string;
    if (data[guildId].skip(data, guildId, connection, interaction)) {
        str = `Playing ${data[guildId].songs[0]}`;
        if (interaction.replied) return await interaction.channel?.send(str);
        return await interaction.reply(str);
    } else {
        str = 'Finished playing';
        if (interaction.replied) return await interaction.channel?.send(str);
        return await interaction.reply(str);
    }
}

export async function checkLink(link: string, interaction: CommandInteraction) {
    if (typeof link !== "string") return interaction.reply({ content: 'You must enter a youtube video link or search phrase.', ephemeral: true });
    else if (link.search(new RegExp('^((?:https?:)?\\/\\/)?((?:www|m)\\.)?((?:youtube?\\.com|youtu.be))(\\/(?:[\\w\\-]+\\?v=|embed\\/|v\\/)?)(playlist)(\\S+)?$')) !== -1) {
        let output = await ytpl(link);
        let out: string[] = [];
        for (let item of output.items) {
            out.push(item.shortUrl);
        }
        return out;
    }
    else if (link.search(new RegExp('http(?:s?):\\/\\/(?:www\\.)?youtu(?:be\\.com\\/watch\\?v=|\\.be\\/)([\\w\\-\\_]*)(&(amp;)?‌​[\\w\\?‌​=]*)?')) === -1
    ) {
        let output = await yts(link, { limit: 1, pages: 1 });
        if (!output.items[0] || output.items[0].type !== 'video') {
            await interaction.reply({ content: 'No results for given phrase. Try another one or use a valid link.', ephemeral: true });
            return null;
        }
        return output.items[0].url;
    } else return link;
}

export function defaultErrorCheck(interaction: CommandInteraction, data: GuildMusDataArr, short: boolean = false) {
    function reply(str: string) {
        interaction.reply({ content: str, ephemeral: true });
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
    if (short) return { guildId, voiceChannel };

    const connection = getVoiceConnection(guildId);
    if (connection?.joinConfig.channelId !== member.voice.channel?.id) return reply('You must be in a voice channel with the bot.');
    if (!data[guildId] || !connection) return reply('You must be in a voice channel with the bot.');

    return { member, guildId, connection, voiceChannel };
}

export type GuildMusDataArr = {
    [key: string]: GuildMusData
};
export const guildsMusDataArr: GuildMusDataArr = {};

export class GuildMusData {
    audioPlayer: AudioPlayer;
    songs: string[];
    loop: boolean;
    loopQueue: boolean;

    constructor(player: AudioPlayer, link?: string) {
        this.audioPlayer = player;
        this.songs = [];
        this.loop = false;
        this.loopQueue = false;
        if (link) this.songs.push(link);
    }

    initialise(data: GuildMusDataArr, guildId: string, interaction: CommandInteraction, connection: VoiceConnection) {
        data[guildId].audioPlayer.on('error', error => {
            console.error('Error:', error.message);
        });
        data[guildId].audioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.loop ? this.playSong(interaction) :
                guildSkip(interaction, data, guildId, connection);
        });
    }

    async playSong(interaction: CommandInteraction) {
        return new Promise<void>((res, rej) => Track.from(this.songs[0])
            .then(stream => stream.createAudioResource())
            .then(resource => {
                resource.playStream.on('readable', async () => {
                    this.audioPlayer.play(resource);
                });
            })
            .catch(err => {
                interaction.channel?.send('Error while trying to play this song.')
                rej(err);
            }));
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

    skip(data: GuildMusDataArr, guildId: string, connection: VoiceConnection, interaction: CommandInteraction): boolean {
        if (this.loopQueue) {
            this.songs.push(this.songs.shift() as string);
        } else {
            this.songs.shift();
        }
        if (this.songs.length > 0) {
            this.playSong(interaction).catch(err => guildSkip(interaction, data, guildId, connection));
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