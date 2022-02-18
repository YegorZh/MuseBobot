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
        .setName('loopqueue')
        .setDescription('Whether to loop the queue or not'),
    execute(interaction, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield (0, guildMusData_1.defaultErrorCheck)(interaction, data);
            if (!check)
                return;
            const { guildId } = check;
            data[guildId].loopQueue = !data[guildId].loopQueue;
            if (data[guildId].loopQueue) {
                yield interaction.reply(`Now looping queue`);
            }
            else {
                yield interaction.reply(`Not looping queue anymore`);
            }
        });
    }
};
