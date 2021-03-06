"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs = __importStar(require("fs"));
const discord_js_1 = require("discord.js");
const guildMusData_1 = require("./guildMusData");
if (process.env.NODE_ENV !== 'production')
    require('dotenv').config();
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES] });
let commands = new discord_js_1.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.set(command.data.name, command);
}
client.once('ready', () => {
    console.log('Ready!');
});
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!interaction.isCommand())
        return;
    const command = commands.get(interaction.commandName);
    if (!command)
        return;
    const today = new Date();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const guild = ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.name) || 'Guild';
    const name = ((_b = interaction.member) === null || _b === void 0 ? void 0 : _b.user.username) || 'name';
    const log = `At ${time} ${interaction.commandName} in ${guild} by ${name}`;
    // fs.writeFile('logs.txt', log, err => {if(err) console.log(err)});
    console.log(log);
    try {
        yield command.execute(interaction, guildMusData_1.guildsMusDataArr);
    }
    catch (error) {
        console.error(error);
        // await interaction.({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}));
client.login(process.env.TOKEN);
