"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.GuildMusData = exports.guildsMusDataArr = exports.defaultErrorCheck = exports.guildSkip = void 0;
const voice_1 = require("@discordjs/voice");
const youtubedl = require('youtube-dl-exec');
const discord_js_1 = require("discord.js");
const https = __importStar(require("https"));
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
        youtubedl(this.songs[0], { f: '249', dumpJson: true }).then((output) => {
            https.get(output.url, (response) => {
                if (response.statusCode === 200) {
                    const resource = (0, voice_1.createAudioResource)(response, {
                        inputType: voice_1.StreamType.WebmOpus
                    });
                    resource.playStream.on('readable', () => __awaiter(this, void 0, void 0, function* () {
                        this.audioPlayer.play(resource);
                    }));
                }
            });
        });
    }
    skip(data, guildId, connection) {
        this.songs.shift();
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
