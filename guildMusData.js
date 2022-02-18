"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildMusData = exports.guildsMusDataArr = exports.defaultErrorCheck = exports.checkLink = exports.guildSkip = void 0;
const voice_1 = require("@discordjs/voice");
const youtubedl = require('youtube-dl-exec');
const discord_js_1 = require("discord.js");
const track_1 = require("./track");
const ytpl = require('ytpl');
const yts = require('ytsr');
function guildSkip(interaction, data, guildId, connection) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let str;
        if (data[guildId].skip(data, guildId, connection)) {
            str = `Playing ${data[guildId].songs[0]}`;
            if (interaction.replied)
                return yield ((_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.send(str));
            return yield interaction.reply(str);
        }
        else {
            str = 'Finished playing';
            if (interaction.replied)
                return yield ((_b = interaction.channel) === null || _b === void 0 ? void 0 : _b.send(str));
            return yield interaction.reply(str);
        }
    });
}
exports.guildSkip = guildSkip;
function checkLink(link, interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof link !== "string")
            return interaction.reply({ content: 'You must enter a youtube video link or search phrase.', ephemeral: true });
        else if (link.search(new RegExp('^((?:https?:)?\\/\\/)?((?:www|m)\\.)?((?:youtube?\\.com|youtu.be))(\\/(?:[\\w\\-]+\\?v=|embed\\/|v\\/)?)(playlist)(\\S+)?$')) !== -1) {
            let output = yield ytpl(link);
            let out = [];
            for (let item of output.items) {
                out.push(item.shortUrl);
            }
            return out;
        }
        else if (link.search(new RegExp('http(?:s?):\\/\\/(?:www\\.)?youtu(?:be\\.com\\/watch\\?v=|\\.be\\/)([\\w\\-\\_]*)(&(amp;)?‌​[\\w\\?‌​=]*)?')) === -1) {
            let output = yield yts(link, { limit: 1, pages: 1 });
            if (!output.items[0] || output.items[0].type !== 'video') {
                yield interaction.reply({ content: 'No results for given phrase. Try another one or use a valid link.', ephemeral: true });
                return null;
            }
            return output.items[0].url;
        }
        else
            return link;
    });
}
exports.checkLink = checkLink;
function defaultErrorCheck(interaction, data, short = false) {
    var _a, _b, _c, _d, _e;
    function reply(str) {
        interaction.reply({ content: str, ephemeral: true });
        return null;
    }
    const textChannel = interaction.channel;
    if (!textChannel)
        return reply('Some dumb error with text channel, try another one');
    if (!((_b = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.me) === null || _b === void 0 ? void 0 : _b.permissionsIn(textChannel).has(["SEND_MESSAGES", "VIEW_CHANNEL"])))
        return reply('Bot has no permissions in this text channel.');
    const member = interaction.member;
    if (!(member instanceof discord_js_1.GuildMember))
        return reply('Some dumb error with missing user i dunno.');
    const voiceChannel = member.voice.channel;
    if (!voiceChannel)
        return reply('You must be in a voice channel with the bot.');
    if (!((_d = (_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.me) === null || _d === void 0 ? void 0 : _d.permissionsIn(voiceChannel)).has(["SPEAK", "CONNECT"]))
        return reply('Bot has no permissions in your voice channel');
    const guildId = voiceChannel.guildId;
    if (short)
        return { guildId, voiceChannel };
    const connection = (0, voice_1.getVoiceConnection)(guildId);
    if ((connection === null || connection === void 0 ? void 0 : connection.joinConfig.channelId) !== ((_e = member.voice.channel) === null || _e === void 0 ? void 0 : _e.id))
        return reply('You must be in a voice channel with the bot.');
    if (!data[guildId] || !connection)
        return reply('You must be in a voice channel with the bot.');
    return { member, guildId, connection, voiceChannel };
}
exports.defaultErrorCheck = defaultErrorCheck;
exports.guildsMusDataArr = {};
class GuildMusData {
    constructor(player, link) {
        this.audioPlayer = player;
        this.songs = [];
        this.loop = false;
        this.loopQueue = false;
        if (link)
            this.songs.push(link);
    }
    initialise(data, guildId, interaction, connection) {
        data[guildId].audioPlayer.on('error', error => {
            console.error('Error:', error.message);
        });
        data[guildId].audioPlayer.on(voice_1.AudioPlayerStatus.Idle, () => {
            this.loop ? this.playSong() :
                guildSkip(interaction, data, guildId, connection);
        });
    }
    playSong() {
        track_1.Track.from(this.songs[0]).then(stream => {
            stream.createAudioResource().then(resource => {
                resource.playStream.on('readable', () => __awaiter(this, void 0, void 0, function* () {
                    this.audioPlayer.play(resource);
                }));
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
    skip(data, guildId, connection) {
        if (this.loopQueue) {
            this.songs.push(this.songs.shift());
        }
        else {
            this.songs.shift();
        }
        if (this.songs.length > 0) {
            this.playSong();
            return true;
        }
        else {
            this.destroy(data, guildId, connection);
            return false;
        }
    }
    destroy(data, guildId, connection) {
        this.audioPlayer.stop();
        delete data[guildId];
        connection.destroy();
    }
}
exports.GuildMusData = GuildMusData;
