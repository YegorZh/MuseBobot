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
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays first found youtube video by keyword or link.'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = interaction.member;
            if (member.voice.channel) {
                const connection = (0, voice_1.joinVoiceChannel)({
                    channelId: member.voice.channel.id,
                    guildId: member.voice.channel.guild.id,
                    adapterCreator: member.voice.channel.guild.voiceAdapterCreator,
                });
            }
            yield interaction.reply('Pong!');
        });
    }
};
