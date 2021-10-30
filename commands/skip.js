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
const discord_js_1 = require("discord.js");
const guildMusData_1 = require("../guildMusData");
const voice_1 = require("@discordjs/voice");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips current track'),
    execute(interaction, data) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const member = interaction.member;
            if (!(member instanceof discord_js_1.GuildMember))
                return yield interaction.reply({ content: 'Some dumb error with missing user i dunno.', ephemeral: true });
            const guildId = (_a = member.voice.channel) === null || _a === void 0 ? void 0 : _a.guild.id;
            if (!guildId)
                return yield interaction.reply({ content: 'You must be in a voice channel with the bot.', ephemeral: true });
            const connection = (0, voice_1.getVoiceConnection)(guildId);
            if ((connection === null || connection === void 0 ? void 0 : connection.joinConfig.channelId) !== ((_b = member.voice.channel) === null || _b === void 0 ? void 0 : _b.id))
                return yield interaction.reply({ content: 'You must be in a voice channel with the bot.', ephemeral: true });
            if (!data[guildId] || !connection)
                return yield interaction.reply({ content: 'Bot isn\'t playing any songs' });
            yield (0, guildMusData_1.guildSkip)(interaction, data, guildId, connection);
        });
    }
};
