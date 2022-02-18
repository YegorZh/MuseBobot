import { SlashCommandBuilder } from '@discordjs/builders'
import {CommandInteraction, GuildMember} from "discord.js";
import {defaultErrorCheck, GuildMusData, GuildMusDataArr} from "../guildMusData";
import {getVoiceConnection} from "@discordjs/voice";



module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Whether to loop the song or not'),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {
        const check = await defaultErrorCheck(interaction, data);
        if(!check) return;
        const {guildId} = check;

        data[guildId].loop = !data[guildId].loop;
        if(data[guildId].loop){
            await interaction.reply(`Now looping song`);
        } else {
            await interaction.reply(`Not looping song anymore`);
        }
    }
}