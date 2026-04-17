const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { general } = require("../DataBaseJson");

async function config(interaction, client) {
  const status = general.get("ticket.status") || false;

  const embed4 = new EmbedBuilder()
    .setAuthor({ name: `Painel Ticket AI - ARK SOLUTIONS` })
    .setDescription(`Olá senhor(a) ${interaction.user}, o que deseja fazer?`)
    .setColor("#4800ff")
    .addFields(
      { name: `Painel:`, value: `${status ? '\`🟢 Online\`' : '\`🔴 Offline\`'}`, inline: true },
      { name: `Versão:`, value: `**__2.0.1__**`, inline: true },
      { name: `Ultima reinicialização:`, value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
    )
    .setImage(`https://i.imgur.com/WfjAnZt.png`)
    .setFooter({ text: `Ark Solutions © Copyright `, iconURL: interaction.guild.iconURL() })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("statusticket")
      .setLabel(status ? 'Online' : 'Offline')
      .setEmoji(status ? "1236021048470933575" : "1236021106662707251")
      .setStyle(status ? 3 : 4),
    new ButtonBuilder()
      .setCustomId("ticketconfig2024")
      .setLabel("Ticket")
      .setEmoji("1352729414055493642")
      .setStyle(2),
    new ButtonBuilder()
      .setCustomId("inteligenciaartificial")
      .setLabel("Assistente Virtual ( IA )")
      .setEmoji("1352729333952679986")
      .setStyle(2)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("chaveReciboConfig")
      .setLabel("Pagamentos")
      .setEmoji("1352729318404522084")
      .setStyle(3),
    new ButtonBuilder()
      .setCustomId("configuracoes")
      .setLabel("Logs/Canais")
      .setEmoji("1352729436050423918")
      .setStyle(2)
  );

  if (interaction.message == undefined) {
    interaction.reply({ components: [row, row2], embeds: [embed4], ephemeral: true });
  } else {
    interaction.update({ components: [row, row2], embeds: [embed4], ephemeral: true });
  }
}

async function configuracoes(interaction, client) {
  const embed4 = new EmbedBuilder()
    .setAuthor({ name: `${interaction.guild.name} - Gerenciamento Canais/Logs` })
    .setDescription(`-# Painel de Gerenciamento dos **Canais/Logs**`)
    .setColor("#4800ff")
    .addFields(
      { name: `Logs Staff`, value: `${general.get("ticket.definicoes.logsstaff") ? `<#${general.get("ticket.definicoes.logsstaff")}>` : `\`🔴 Não configurado.\``}` },
      { name: `Cargo Suporte`, value: `${general.get("ticket.definicoes.cargostaff") ? `<@&${general.get("ticket.definicoes.cargostaff")}>` : `\`🔴 Não configurado.\``}` },
      { name: `Categoria Tickets`, value: `${general.get("ticket.definicoes.categoriaticket") ? `<#${general.get("ticket.definicoes.categoriaticket")}>` : `\`🔴 Não configurado.\``}` },
    )
    .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("alterarlogs")
      .setLabel("Logs Staffs")
      .setEmoji("1352729362511827074")
      .setStyle(2),
    new ButtonBuilder()
      .setCustomId("alterarcargostaff")
      .setLabel("Cargo Suporte")
      .setEmoji("1352729340722413720")
      .setStyle(2),
    new ButtonBuilder()
      .setCustomId("alterarcategoriaticket")
      .setLabel("Categoria Tickets")
      .setEmoji("1352729343608225873")
      .setStyle(2)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("voltar00")
      .setEmoji("1352729366328508507")
      .setStyle(2)
  );

  interaction.update({ components: [row, row2], embeds: [embed4], ephemeral: true });
}

async function configticket(interaction, client) {
  const embed4 = new EmbedBuilder()
    .setAuthor({ name: `${interaction.guild.name} - Gerenciamento Estrutura` })
    .setDescription(`-# Configure a Estrutura do seu Ticket Abaixo`)
    .setColor("#4800ff")
    .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("configticket")
      .setLabel("Sistema")
      .setEmoji("1352729323773100052")
      .setStyle(2),
    new ButtonBuilder()
      .setCustomId("configaparencia")
      .setLabel("Aparência")
      .setEmoji("1352729321176956928")
      .setStyle(2),
    new ButtonBuilder()
      .setCustomId("funcoesticket")
      .setLabel("Funções")
      .setEmoji("1352729340722413720")
      .setStyle(2),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("voltar00")
      .setEmoji("1352729366328508507")
      .setStyle(1)
  );

  interaction.update({ components: [row, row2], embeds: [embed4], ephemeral: true });
}

async function aparencia(interaction, client) {
  const status = general.get("ticket.tipomsg") || false;
  const bannerUrl = general.get("ticket.aparencia.banner") || null;
  const miniaturaUrl = general.get("ticket.aparencia.miniatura") || null;

  const embed4 = new EmbedBuilder()
    .setAuthor({ name: `${interaction.guild.name} - Gerenciamento Aparência` })
    .setDescription(`-# Bem Vindo ao Painel de **Aparência Ticket**`)
    .setColor("#4800ff")
    .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
    .setTimestamp();

  if (status) {
    embed4.addFields(
      { name: `Mode Send`, value: "\`🎨 Content\`" },
      { name: `Mensagem`, value: `\`\`\`${general.get("ticket.aparencia.content") || "👋🏻 | Olá, utilize o botão abaixo para abrir um ticket"}\`\`\`` },
      { name: `Banner`, value: bannerUrl ? `[Abrir Imagem](${bannerUrl})` : "\`🔴 Não configurado.\`" }
    );
  } else {
    embed4.addFields(
      { name: `Mode Send`, value: "\`🎨 Embed\`" },
      { name: `Informações`, value: `**Título:** \`${general.get("ticket.aparencia.titulo") || "Atendimento ao cliente"}\`\n**Descrição:** \`${general.get("ticket.aparencia.descricao") || "👋 Olá, utilize o botão abaixo para abrir um ticket"}\`\n**Color:** \`${general.get("ticket.aparencia.cor") || "#000000"}\`` },
      { name: `Imagens`, value: `**Banner:** ${bannerUrl ? `[Abrir Imagem](<${bannerUrl}>)` : "\`🔴 Não configurado.\`"}\n**Miniatura:** ${miniaturaUrl ? `[Abrir Imagem](<${miniaturaUrl}>)` : "\`🔴 Não configurado.\`"}` }
    );
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("gerenciaraparencia")
      .setLabel("Personalizar Design")
      .setEmoji("1352729419365744670")
      .setStyle(2),
    new ButtonBuilder()
      .setCustomId("gerenciatipo")
      .setLabel(status ? "Mode Content" : "Mode Embed")
      .setEmoji("1352729369264521419")
      .setStyle(3),
    new ButtonBuilder()
      .setCustomId("configbotao")
      .setLabel("Button Config")
      .setEmoji("1352729414055493642")
      .setStyle(2)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticketconfig2024")
      .setEmoji("1352729366328508507")
      .setStyle(2)
  );

  interaction.update({ components: [row, row2], embeds: [embed4], ephemeral: true });
}

module.exports = {
  config,
  configuracoes,
  configticket,
  aparencia
};