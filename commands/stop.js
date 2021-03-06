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
        .setName('stop')
        .setDescription('Completely stops the bot and exits the voice channel'),
    execute(interaction, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = (0, guildMusData_1.defaultErrorCheck)(interaction, data);
            if (!check || !check.connection)
                return;
            const { guildId, connection } = check;
            data[guildId].destroy(data, guildId, connection);
            yield interaction.reply('Stopped playing');
        });
    }
};
