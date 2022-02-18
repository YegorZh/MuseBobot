import { SlashCommandBuilder } from '@discordjs/builders'
import {CommandInteraction, GuildMember} from "discord.js";
import {defaultErrorCheck, GuildMusData, GuildMusDataArr} from "../guildMusData";
import {getVoiceConnection} from "@discordjs/voice";



module.exports = {
    data: new SlashCommandBuilder()
        .setName('loopqueue')
        .setDescription('Whether to loop the playlist or not'),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {
        const check = await defaultErrorCheck(interaction, data);
        if(!check) return;
        const {guildId} = check;

        data[guildId].loopQueue = !data[guildId].loopQueue;
        if(data[guildId].loopQueue){
            await interaction.reply(`Now looping playlist`);
        } else {
            await interaction.reply(`Not looping playlist anymore`);
        }
    }
}