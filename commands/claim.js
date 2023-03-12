const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('claim')
		.setDescription('Defina o bilhete como reivindicado.'),
	async execute(interaction, client) {
    const {claim} = require('../utils/claim.js');
    claim(interaction, client);
	},
};