const fs = require('fs-extra');
const path = require('node:path');
const expressApp = require("express")();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = process.env.TOKEN_APP ? { } : require('./config/token.json');
const { QuickDB } = require('quick.db');
const jsonc = require('jsonc');
const db = new QuickDB();

module.exports = {
	expressApp
}

process.on('unhandledRejection', (reason, promise, a) => {
	console.log(reason, promise, a)
})

process.stdout.write(`\nStarting aplication...`);
process.stdout.write(`\nConnecting to Discord...`);

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	]
});

process.stdout.write(`\nCreate client...`);
// All variables stored in the client object
client.db = db;
client.discord = require('discord.js');
client.config = jsonc.parse(fs.readFileSync(path.join(__dirname, 'config/config.jsonc'), 'utf8'));

client.locales = require(`./locales/${client.config.lang}.json`);
client.embeds = client.locales.embeds;
client.log = require("./utils/logs.js").log;
client.msToHm = function dhm(ms) {
	const days = Math.floor(ms / (24 * 60 * 60 * 1000));
	const daysms = ms % (24 * 60 * 60 * 1000);
	const hours = Math.floor(daysms / (60 * 60 * 1000));
	const hoursms = ms % (60 * 60 * 1000);
	const minutes = Math.floor(hoursms / (60 * 1000));
	const minutesms = ms % (60 * 1000);
	const sec = Math.floor(minutesms / 1000);

	if (days > 0) return `${days}d ${hours}h ${minutes}m ${sec}s`;
	if (hours > 0) return `${hours}h ${minutes}m ${sec}s`;
	if (minutes > 0) return `${minutes}m ${sec}s`;
	if (sec > 0) return `${sec}s`;
	return "0s";
}

// Command handler
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

process.stdout.write(`\nListing commands...`);

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

// Execute commands
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction)
	console.log(interaction.commandName)
	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		console.log({
			client
		})
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
	}
});

// Event handler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

process.stdout.write(`\nListing commands...`);

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}


process.stdout.write(`\nApplying the token...`);

// Login the bot
client.login(process.env.TOKEN_APP || token);