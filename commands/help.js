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
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all commands and their descriptions'),
    execute(interaction, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const str = 'Play: plays the song from the link (or first result of search phrase) replacing current playing track.\n' +
                'Add: adds song to the queue.\n' +
                'Skip: skips current song.\n' +
                'Loop: loops or stops looping current song.\n' +
                'LoopQueue: loops entire queue.\n' +
                'Pause: pauses playing.\n' +
                'Resume: resumes playing.\n' +
                'Stop: makes bot completely stop playing and exit the voice channel.';
            yield interaction.reply({ content: str, ephemeral: true });
        });
    }
};
