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
exports.GuildMusData = exports.guildsMusDataArr = void 0;
const voice_1 = require("@discordjs/voice");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
exports.guildsMusDataArr = {};
class GuildMusData {
    constructor(player, link) {
        this.audioPlayer = player;
        this.songs = [];
        if (link)
            this.songs.push(link);
    }
    playSong() {
        const resource = (0, voice_1.createAudioResource)((0, ytdl_core_1.default)(this.songs[0], { filter: 'audioonly', quality: 'highestaudio' }), {
            inputType: voice_1.StreamType.WebmOpus
        });
        resource.playStream.on('readable', () => __awaiter(this, void 0, void 0, function* () {
            this.audioPlayer.play(resource);
        }));
    }
}
exports.GuildMusData = GuildMusData;
