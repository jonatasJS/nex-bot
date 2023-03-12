module.exports = {
  async log(logsType, logs, client) {
    if (!client.config.logs) return;
    if (!client.config.logsChannelId) return;
    const channel = await client.channels.fetch(client.config.logsChannelId).catch(e => console.error("The channel to log events is not found!\n", e));
    if (!channel) return console.error("The channel to log events is not found!");

    let webhooks = await channel.fetchWebhooks()
    if (webhooks.size === 0) {
      await channel.createWebhook({ name: "Ticket Bot Logs" });
      webhooks = await channel.fetchWebhooks();
    }
    const webhook = webhooks.first();

    if (logsType === "ticketCreate") {
      const embed = new client.discord.EmbedBuilder()
        .setColor("3ba55c")
        .setAuthor({ name: logs.user.tag, iconURL: logs.user.avatarURL })
        .setDescription(`${logs.user.tag} (<@${logs.user.id}>) Criou um ticket (<#${logs.ticketChannelId}>) com o motivo: \`${logs.reason}\``);

      webhook.send({
        username: "Ticket Criada",
        avatarURL: "https://i.imgur.com/M38ZmjM.png",
        embeds: [embed]
      }).catch(e => console.log(e));
    };

    if (logsType === "ticketClaim") {
      const embed = new client.discord.EmbedBuilder()
        .setColor("faa61a")
        .setAuthor({ name: logs.user.tag, iconURL: logs.user.avatarURL })
        .setDescription(`${logs.user.tag} (<@${logs.user.id}>) Reivindicou o ticket n°${logs.ticketId} (<#${logs.ticketChannelId}>) depois de ${client.msToHm(new Date(Date.now() - logs.ticketCreatedAt))} de criação`);

      webhook.send({
        username: "Ticket Reivindicada",
        avatarURL: "https://i.imgur.com/qqEaUyR.png",
        embeds: [embed]
      }).catch(e => console.log(e));
    };

    if (logsType === "ticketClose") {
      const embed = new client.discord.EmbedBuilder()
        .setColor("ed4245")
        .setAuthor({ name: logs.user.tag, iconURL: logs.user.avatarURL })
        .setDescription(`${logs.user.tag} (<@${logs.user.id}>) Fechou o ticket n°${logs.ticketId} (<#${logs.ticketChannelId}>) com o motivo: \`${logs.reason}\` depois de ${client.msToHm(new Date(Date.now() - logs.ticketCreatedAt))} de criação`);

      webhook.send({
        username: "Ticket fechado",
        avatarURL: "https://i.imgur.com/5ShDA4g.png",
        embeds: [embed]
      }).catch(e => console.log(e));
    };

    if (logsType === "ticketDelete") {
      const embed = new client.discord.EmbedBuilder()
        .setColor("ed4245")
        .setAuthor({ name: logs.user.tag, iconURL: logs.user.avatarURL })
        .setDescription(`${logs.user.tag} (<@${logs.user.id}>) Excluiu o ticket n°${logs.ticketId} depois de ${client.msToHm(new Date(Date.now() - logs.ticketCreatedAt))} de criação\n\nTranscript: ${logs.transcriptURL}`);

      webhook.send({
        username: "Ticket Excluída",
        avatarURL: "https://i.imgur.com/obTW2BS.png",
        embeds: [embed]
      }).catch(e => console.log(e));
    };

    if (logsType === "userAdded") {
      const embed = new client.discord.EmbedBuilder()
        .setColor("3ba55c")
        .setAuthor({ name: logs.user.tag, iconURL: logs.user.avatarURL })
        .setDescription(`${logs.user.tag} (<@${logs.user.id}>) Adicionada <@${logs.added.id}> (${logs.added.id}) ao ticket n°${logs.ticketId} (<#${logs.ticketChannelId}>)`);

      webhook.send({
        username: "User Adicionada",
        avatarURL: "https://i.imgur.com/G6QPFBV.png",
        embeds: [embed]
      }).catch(e => console.log(e));
    };

    if (logsType === "userRemoved") {
      const embed = new client.discord.EmbedBuilder()
        .setColor("ed4245")
        .setAuthor({ name: logs.user.tag, iconURL: logs.user.avatarURL })
        .setDescription(`${logs.user.tag} (<@${logs.user.id}>) Removida <@${logs.removed.id}> (${logs.removed.id}) de ticket n°${logs.ticketId} (<#${logs.ticketChannelId}>)`);

      webhook.send({
        username: "User Removida",
        avatarURL: "https://i.imgur.com/eFJ8xxC.png",
        embeds: [embed]
      }).catch(e => console.log(e));
    };
  }
};