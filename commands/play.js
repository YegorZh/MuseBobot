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
const builders_1 = require("@discordjs/builders");
const voice_1 = require("@discordjs/voice");
const guildMusData_1 = require("../guildMusData");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays first found youtube video by keyword or link.')
        .addStringOption(option => option.setName('link').setDescription('Link or search phrase').setRequired(true)),
    execute(interaction, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = (0, guildMusData_1.defaultErrorCheck)(interaction, data, true);
            if (!check)
                return;
            const { guildId, voiceChannel: channel } = check;
            let link = interaction.options.getString('link');
            link = yield (0, guildMusData_1.checkLink)(link, interaction);
            if (!link)
                return;
            const connection = (0, voice_1.joinVoiceChannel)({
                channelId: channel.id,
                guildId: guildId,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            if (!data[guildId]) {
                data[guildId] = new guildMusData_1.GuildMusData((0, voice_1.createAudioPlayer)());
                data[guildId].initialise(data, guildId, interaction, connection);
            }
            let player = data[guildId].audioPlayer;
            connection.subscribe(player);
            if (typeof link === 'string') {
                data[guildId].songs[0] = link;
            }
            else {
                data[guildId].songs[0] = link[0];
                for (let i = 1; i < link.length; i++) {
                    data[guildId].songs.push(link[i]);
                }
            }
            if (player.state.status === voice_1.AudioPlayerStatus.Paused) {
                player.unpause();
            }
            data[guildId].playSong();
            if (typeof link === 'string')
                return yield interaction.reply(`Playing ${link}`);
            return yield interaction.reply(`Playlist ${interaction.options.getString('link')}` + ` added.\nPlaying ${link[0]}`);
        });
    }
};
