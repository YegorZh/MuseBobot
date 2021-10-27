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
const builders_1 = require("@discordjs/builders");
const voice_1 = require("@discordjs/voice");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays first found youtube video by keyword or link.')
        .addStringOption(option => option.setName('link').setDescription('Link duh').setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = interaction.member;
            if (member.voice.channel) {
                const connection = (0, voice_1.joinVoiceChannel)({
                    channelId: member.voice.channel.id,
                    guildId: member.voice.channel.guild.id,
                    adapterCreator: member.voice.channel.guild.voiceAdapterCreator,
                });
                const player = (0, voice_1.createAudioPlayer)();
                connection.subscribe(player);
                player.on('error', error => {
                    console.error('Error:', error.message);
                });
                const link = interaction.options.getString('link');
                if (typeof link !== "string")
                    return interaction.reply('Error with given data');
                const resource = (0, voice_1.createAudioResource)((0, ytdl_core_1.default)(link, { filter: 'audioonly', quality: 'highestaudio' }), {
                    inputType: voice_1.StreamType.WebmOpus
                });
                resource.playStream.on('readable', () => __awaiter(this, void 0, void 0, function* () {
                    player.play(resource);
                    yield interaction.reply(`Playing ${link}`);
                }));
            }
            else {
                yield interaction.reply({ content: 'You must be in a voice channel.', ephemeral: true });
            }
        });
    }
};
