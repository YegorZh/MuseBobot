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
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
function playSong(interaction, servData) {
    const resource = (0, voice_1.createAudioResource)((0, ytdl_core_1.default)(servData.songs[0], { filter: 'audioonly', quality: 'highestaudio' }), {
        inputType: voice_1.StreamType.WebmOpus
    });
    resource.playStream.on('readable', () => __awaiter(this, void 0, void 0, function* () {
        servData.audioPlayer.play(resource);
    }));
}
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays first found youtube video by keyword or link.')
        .addStringOption(option => option.setName('link').setDescription('Link duh').setRequired(true)),
    execute(interaction, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = interaction.member;
            if (!(member instanceof discord_js_1.GuildMember))
                return yield interaction.reply({ content: 'Some dumb error with member type', ephemeral: true });
            const channel = member.voice.channel;
            if (!channel)
                return yield interaction.reply({ content: 'You must be in a voice channel.', ephemeral: true });
            const link = interaction.options.getString('link');
            if (typeof link !== "string")
                return interaction.reply({ content: 'You must enter a link or a keyword.', ephemeral: true });
            const guildId = channel.guild.id;
            const connection = (0, voice_1.joinVoiceChannel)({
                channelId: channel.id,
                guildId: guildId,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            if (!data[guildId]) {
                data[guildId] = {
                    audioPlayer: (0, voice_1.createAudioPlayer)(),
                    songs: []
                };
                data[guildId].audioPlayer.on('error', error => {
                    console.error('Error:', error.message);
                });
                data[guildId].audioPlayer.on(voice_1.AudioPlayerStatus.Idle, () => {
                    data[guildId].songs.shift();
                    if (data[guildId].songs.length > 0) {
                        playSong(interaction, data[guildId]);
                        interaction.followUp(`Playing ${data[guildId].songs[0]}`);
                    }
                    else {
                        interaction.followUp('Finished playing');
                        data[guildId].audioPlayer.stop();
                        delete data[guildId];
                        connection.destroy();
                    }
                });
            }
            let player = data[guildId].audioPlayer;
            connection.subscribe(player);
            data[guildId].songs.push(link);
            if (player.state.status === voice_1.AudioPlayerStatus.Paused) {
                player.unpause();
            }
            if (player.state.status === voice_1.AudioPlayerStatus.Idle) {
                playSong(interaction, data[guildId]);
                yield interaction.reply(`Playing ${link}`);
            }
            else
                yield interaction.reply(`Song ${link} added to playlist`);
        });
    }
};