import { SlashCommandBuilder } from '@discordjs/builders'
import {CommandInteraction, Guild, GuildMember} from "discord.js";
import {defaultErrorCheck, GuildMusDataArr, guildSkip} from "../guildMusData";
import {getVoiceConnection, VoiceConnection} from "@discordjs/voice";



module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips current track'),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {
        const check = defaultErrorCheck(interaction, data);
        if(!check || !check.connection) return;
        const {guildId, connection} = check;

        await guildSkip(interaction, data, guildId, connection);
    }
}