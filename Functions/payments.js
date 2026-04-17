const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { general } = require("../DataBaseJson");

async function payments(interaction, client) {
  const sistemaMp = await general.get("auto.sistemaMp") || false;
  const mp = await general.get("auto.mp") || null;

  const sistemaSemi = await general.get("semi.sistema") || false;
  const chave = await general.get("semi.chave") || null;

  interaction.update({
    content: ``,
    embeds: [
      new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name} - Gerenciamento` })
        .setDescription(`Olá ${interaction.user}, Bem-vindo ao Sistema de Pagamentos do Bot. Use os botões abaixo para escolher seu sistema.`)
        .addFields(
          { 
            name: `Sistema Automático`, 
            value: `${sistemaMp ? "`🟢 | Online` **Sistema**" : "`🔴 | Offline` **Sistema**"}\n${mp ? "\`(📡 | RUNNING)\` **API**" : "\`(🔎 | NOT FOUND)\` **API**"}`,
            inline: true 
          },
          { 
            name: `Sistema Semi Auto`, 
            value: `${sistemaSemi ? "`🟢 | Online` **Sistema**" : "`🔴 | Offline` **Sistema**"}\n${chave ? "\`(📫 | SETADA)\` **Chave**" : "\`(🔎 | NOT FOUND)\` **Chave**"}`,
            inline: true 
          }
        )
        .setColor(`#4800ff`)
        .setFooter({ text: `${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp()
    ],
    components: [
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId(`automaticConfig`).setLabel(`Configurar Automático`).setEmoji(`1352729321176956928`).setStyle(1),
          new ButtonBuilder().setCustomId(`semiAutoConfig`).setLabel(`Configurar Semi Auto`).setEmoji(`1352729414055493642`).setStyle(1)
        ),
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId(`voltar00`).setEmoji(`1352729366328508507`).setStyle(2)
        )
    ]
  });
}

async function automatic(interaction, client) {
  const sistemaMp = await general.get("auto.sistemaMp") || false;
  const mp = await general.get("auto.mp") || null;
  const banksOffArray = await general.get("auto.banksOff") || [];
  const banksOff = banksOffArray.length > 0 ? `\`\`\`${banksOffArray.join("\n")}\`\`\`` : "`Nenhum`";

  interaction.update({
    content: ``,
    embeds: [
      new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name} - Gerenciamento` })
        .setDescription(`Olá ${interaction.user}, Bem-vindo ao Painel de Gerenciamento do Sistema Automático.

Observação: Na área de automação de pagamento, você otimiza o processo, eliminando a necessidade de aprovação manual de carrinhos criados. Utilize as funções abaixo para configurar a Credencial do Access Token e bloquear bancos com índices elevados de fraudes.`)
        .addFields(
          { name: `Sistema`, value: sistemaMp ? "`🟢 Online`" : "`🔴 Offline`" },
          { name: `Token:`, value: mp ? `\`\`\`${mp.slice(0, -33) + '***************************'}\`\`\`` : "`🔴 Não configurado.`" },
          { name: `Bancos Bloqueados`, value: banksOff }
        )
        .setColor(`#4800ff`)
        .setFooter({ text: `${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp()
    ],
    components: [
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId(`sistemaMpOnOff`).setLabel(sistemaMp ? "Online" : "Offline").setEmoji(sistemaMp ? "1352729386377281569" : "1352729389204377680").setStyle(sistemaMp ? 3 : 4),
          new ButtonBuilder().setCustomId(`setAccessToken`).setLabel(`Setar Access Token`).setEmoji(`1352729369264521419`).setStyle(2),
          new ButtonBuilder().setCustomId(`antFraudSet`).setLabel(`SafePay`).setEmoji(`1352729323773100052`).setStyle(2)
        ),
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId(`chaveReciboConfig`).setEmoji(`1352729366328508507`).setStyle(2)
        )
    ]
  });
}

async function semiAuto(interaction, client) {
  const sistemaSemi = await general.get("semi.sistema") || false;
  const chave = await general.get("semi.chave") || null;
  const roleAprove = await general.get("semi.roleAprove") || null;

  interaction.update({
    content: ``,
    embeds: [
      new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name} - Gerenciamento` })
        .setDescription(`Olá ${interaction.user}, Bem-vindo ao Painel de Gerenciamento do Sistema Semi-Automático.

Observação: O sistema Semi-Automático é uma solução útil para aqueles que não utilizam o Mercado Pago. Nesse modelo, a aprovação dos pagamentos é feita manualmente para validar as transações de aluguel da loja.

Configure os parâmetros Tipo/Chave e Cargo Aprovador conforme necessário.`)
        .addFields(
          { name: `Sistema`, value: sistemaSemi ? "`🟢 Online`" : "`🔴 Offline`" },
          { name: `Pix:`, value: chave ? "`🟢 Configurado`" : "`🔴 Não configurado.`" },
          { name: `Cargo Aprovador`, value: roleAprove ? `<@&${roleAprove}>` : "`🔴 Não configurado.`" }
        )
        .setColor(`#4800ff`)
        .setFooter({ text: `${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp()
    ],
    components: [
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId(`sistemaSemiOnOff`).setLabel(sistemaSemi ? "Online" : "Offline").setEmoji(sistemaSemi ? "1352729386377281569" : "1352729389204377680").setStyle(sistemaSemi ? 3 : 4),
          new ButtonBuilder().setCustomId(`setAgenceSemi`).setLabel(`Gerenciar PIX e Aprovador`).setEmoji(`1352729321176956928`).setStyle(1)
        ),
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId(`chaveReciboConfig`).setEmoji(`1352729366328508507`).setStyle(2)
        )
    ]
  });

};

async function setAgenceSemi(interaction, client) {

  const tipo = await general.get("semi.tipo") || null;
  const chave = await general.get("semi.chave") || null;
  const roleAprove = await general.get("semi.roleAprove") || null;

  const roleMention = await interaction.guild.roles.cache.get(roleAprove);

  interaction.update({
      content: ``,
      embeds: [
          new EmbedBuilder()
              .setAuthor({ name: `${interaction.guild.name} - Gerenciando Semi-Auto`, iconURL: interaction.user.displayAvatarURL() })
              .setDescription(`-# Olá ${interaction.user}, Bem vindo Ao Painel de Gerenciamento do sistema **Semi-Auto**.`)
              .addFields(
                  { name: `Configuração`, value: `${tipo && chave ? `\`${chave} | ${tipo}\`` : `\`🔴 Não configurado.\``}`, inline: true },
                  { name: `Cargo Aprovador`, value: `${!roleAprove ? `\`🔴 Não configurado.\`` : `${roleMention}`}`, inline: true }
              )
              .setColor(`#4800ff`)
              .setFooter({ text: `${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL() })
              .setTimestamp()
      ],
      components: [
          new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder().setCustomId(`setConfigSemi`).setLabel(`Pix`).setEmoji(`1352729318404522084`).setStyle(1),
                  new ButtonBuilder().setCustomId(`aprovedRoleSemi`).setLabel(`Cargo Aprovador`).setEmoji(`1352729340722413720`).setStyle(1),
              ),
          new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder().setCustomId(`semiAutoConfig`).setEmoji(`1352729366328508507`).setStyle(2)
              )
      ]
  });

};

module.exports = {
  payments,
  automatic,
  semiAuto,
  setAgenceSemi
};