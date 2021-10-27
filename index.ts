import * as fs from 'fs';
import { Command } from './deploy-commands';
import { Client, Intents, Collection } from 'discord.js';
const { token } = require('./botconfig.json');

const client: Client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

let commands = new Collection();
const commandFiles: string[] = fs.readdirSync('./commands').filter(file => file.endsWith('js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    commands.set(command.data.name, command)
}

client.once('ready', () => {
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if(!interaction.isCommand()) return;

    const command: Command = commands.get(interaction.commandName) as Command;
    if(!command) return;

    try{
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(token);
