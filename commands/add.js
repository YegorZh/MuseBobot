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
const guildMusData_1 = require("../guildMusData");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('add')
        .setDescription('Adds song to the playlist')
        .addStringOption(option => option.setName('link').setDescription('Link duh').setRequired(true)),
    execute(interaction, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = (0, guildMusData_1.defaultErrorCheck)(interaction, data);
            if (!check)
                return;
            const { guildId } = check;
            const link = interaction.options.getString('link');
            if (typeof link !== "string" || link.search(new RegExp('http(?:s?):\\/\\/(?:www\\.)?youtu(?:be\\.com\\/watch\\?v=|\\.be\\/)([\\w\\-\\_]*)(&(amp;)?‌​[\\w\\?‌​=]*)?')) === -1)
                return interaction.reply({ content: 'You must enter a youtube video link.', ephemeral: true });
            data[guildId].songs.push(link);
            yield interaction.reply(`Song ${link} was added to playlist`);
        });
    }
};