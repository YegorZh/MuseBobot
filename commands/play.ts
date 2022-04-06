import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, GuildChannel, GuildMember } from "discord.js";
import {
    AudioPlayerStatus,
    createAudioPlayer,
    DiscordGatewayAdapterCreator,
    joinVoiceChannel,
    VoiceConnection
} from "@discordjs/voice";
import { defaultErrorCheck, GuildMusData, GuildMusDataArr, checkLink, guildSkip } from "../guildMusData";


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays first found youtube video by keyword or link.')
        .addStringOption(option => option.setName('link').setDescription('Link or search phrase').setRequired(true)),
    async execute(interaction: CommandInteraction, data: GuildMusDataArr) {
        const check = defaultErrorCheck(interaction, data, true);
        if (!check) return;
        const { guildId, voiceChannel: channel } = check;

        let link: string | string[] = interaction.options.getString('link') as string;
        link = await checkLink(link, interaction);
        if (!link) return;

        const connection: VoiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guildId,
            adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });

        if (!data[guildId]) {
            data[guildId] = new GuildMusData(createAudioPlayer());
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


        if (player.state.status === AudioPlayerStatus.Paused) {
            player.unpause();
        }

        let reply = `Playlist ${interaction.options.getString('link')}` + ` added.\nPlaying ${link[0]}`;
        if (typeof link === 'string') reply = `Playing ${link}`;
        
        data[guildId].playSong(interaction).catch(err => guildSkip(interaction, data, guildId, connection));
        return await interaction.reply(reply);
    }
}