const readline = require('readline');
const { expressApp } = require('..');
const { version } = require("../package.json");

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
    await client.guilds.fetch(client.config.guildId)
    await client.guilds.cache.get(client.config.guildId).members.fetch()
    if (!client.guilds.cache.get(client.config.guildId).members.me.permissions.has("Administrator")) {
      console.log("\n⚠️⚠️⚠️ I don't have the Administrator permission, to prevent any issues please add the Administrator permission to me. ⚠️⚠️⚠️");
      process.exit(0);
    }

    async function sendEmbedToOpen() {
      const embedMessageId = await client.db.get("temp.openTicketMessageId");
      const openTicketChannel = await client.channels.fetch(client.config.openTicketChannelId).catch(e => console.error("The channel to open tickets is not found!\n", e));
        if (!openTicketChannel) return console.error("The channel to open tickets is not found!");
      await openTicketChannel.messages.fetch(embedMessageId)
      .catch(e => console.error("Error when trying to fetch openTicketMessage:\n", e))

      try {if (embedMessageId) openTicketChannel.messages.cache.get(embedMessageId).delete();} catch (e) {console.error}
      let embed = client.embeds.openTicket;

      embed.color = parseInt(client.config.mainColor, 16);
      embed.footer.text = "NEX ROLEPLAY" + client.embeds.ticketOpened.footer.text.replace("NEX ROLEPLAY", "") // Please respect the LICENSE :D

      const row = new client.discord.ActionRowBuilder()
			.addComponents(
				new client.discord.ButtonBuilder()
					.setCustomId('openTicket')
					.setLabel(client.locales.other.openTicketButtonMSG)
					.setStyle(client.discord.ButtonStyle.Primary),
			);

      try { openTicketChannel.send({
        embeds: [embed],
        components: [row]
      })
      .then(msg => {
        client.db.set("temp.openTicketMessageId", msg.id);
      }) } catch(e) {console.error}
    };

    sendEmbedToOpen();

    expressApp.get('/', (req, res) => {
      res.json({
        version
      }).status(203)
    })

    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`\n🚀 Ready! Logged in as \x1b[37;46;1m${client.user.tag}\x1b[0m (\x1b[37;46;1m${client.user.id}\x1b[0m)`);
    expressApp.listen(process.env.PORT || 3000, () => {
      process.stdout.write(`\n🚀 Website ready! Logged in as \x1b[37;46;1mhttp://localhost:3000/\x1b[0m\n`);
    });
	},
};
