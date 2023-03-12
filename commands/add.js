const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add someone to the ticket')
    .addUserOption(input =>
      input.setName('user')
        .setDescription('The user to add')
        .setRequired(true)),
  async execute(interaction, client) {
    const added = interaction.options.getUser('user');
    const ticket = await client.db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return interaction.reply({ content: 'Ticket não encontrado', ephemeral: true }).catch(e => console.log(e));
    if (ticket.invited.includes(added.id)) return interaction.reply({ content: 'Usuário já adicionado', ephemeral: true }).catch(e => console.log(e));

    if (ticket.invited.lenght >= 25) return interaction.reply({ content: "Você não pode adicionar mais de 25 usuários", ephemeral: true }).catch(e => console.log(e));

    client.db.push(`tickets_${interaction.channel.id}.invited`, added.id);

    await interaction.channel.permissionOverwrites.edit(added, {
      SendMessages: true,
      AddReactions: true,
      ReadMessageHistory: true,
      AttachFiles: true,
      ViewChannel: true,
    }).catch(e => console.log(e));

    interaction.reply({ content: `> Adicionado(a) <@${added.id}> ao ticket` }).catch(e => console.log(e));

    client.log("userAdded", {
      user: {
        tag: interaction.user.tag,
        id: interaction.user.id,
        avatarURL: interaction.user.displayAvatarURL()
      },
      ticketId: ticket.id,
      ticketChannelId: interaction.channel.id,
      added: {
        id: added.id,
      }
    }, client);
  },
};