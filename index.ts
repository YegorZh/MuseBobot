import { Client, Intents } from 'discord.js';
import * as botConfig from './botconfig.json';

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
    console.log('Ready!');
});

client.login(botConfig.token);
