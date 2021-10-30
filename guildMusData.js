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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildMusData = exports.guildsMusDataArr = exports.defaultErrorCheck = exports.guildSkip = void 0;
const voice_1 = require("@discordjs/voice");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const discord_js_1 = require("discord.js");
function guildSkip(interaction, data, guildId, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        let str;
        if (data[guildId].skip(data, guildId, connection)) {
            str = `Playing ${data[guildId].songs[0]}`;
            if (interaction.replied)
                return yield interaction.followUp(str);
            return yield interaction.reply(str);
        }
        else {
            str = 'Finished playing';
            if (interaction.replied)
                return yield interaction.followUp(str);
            return yield interaction.reply(str);
        }
    });
}
exports.guildSkip = guildSkip;
function defaultErrorCheck(interaction, data) {
    var _a, _b;
    const member = interaction.member;
    if (!(member instanceof discord_js_1.GuildMember)) {
        interaction.reply({ content: 'Some dumb error with missing user i dunno.', ephemeral: true });
        return null;
    }
    const guildId = (_a = member.voice.channel) === null || _a === void 0 ? void 0 : _a.guild.id;
    if (!guildId) {
        interaction.reply({ content: 'You must be in a voice channel with the bot.', ephemeral: true });
        return null;
    }
    const connection = (0, voice_1.getVoiceConnection)(guildId);
    if ((connection === null || connection === void 0 ? void 0 : connection.joinConfig.channelId) !== ((_b = member.voice.channel) === null || _b === void 0 ? void 0 : _b.id)) {
        interaction.reply({ content: 'You must be in a voice channel with the bot.', ephemeral: true });
        return null;
    }
    if (!data[guildId] || !connection) {
        interaction.reply({ content: 'Bot isn\'t playing any songs' });
        return null;
    }
    return { member, guildId, connection };
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
        const resource = (0, voice_1.createAudioResource)((0, ytdl_core_1.default)(this.songs[0], { filter: 'audioonly', quality: 'highestaudio' }), {
            inputType: voice_1.StreamType.WebmOpus
        });
        resource.playStream.on('readable', () => __awaiter(this, void 0, void 0, function* () {
            this.audioPlayer.play(resource);
        }));
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
