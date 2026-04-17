const {
    EmbedBuilder,
    ChannelType,
    ButtonBuilder,
    ActionRowBuilder,
    ThreadAutoArchiveDuration,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");
const discordTranscripts = require("discord-html-transcripts");

const { general, tickets } = require("../../DataBaseJson");
const { owner } = require("../../config.json");
const fs = require('fs');
const path = require('path');

const transcriptsDir = path.join(__dirname, "..", "..", "transcripts");
if (!fs.existsSync(transcriptsDir)) {
    fs.mkdirSync(transcriptsDir, { recursive: true });
}

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit() && !interaction.isChannelSelectMenu() && !interaction.isUserSelectMenu()) return;

        const { customId, values } = interaction;
        
        if (interaction.isButton() && customId === 'sairticket') {
            const idCanalTicket = interaction.channel.id;
            const donoTicket = tickets.get(`${idCanalTicket}.dono`);

            if (donoTicket !== interaction.user.id) {
                return interaction.reply({ content: "❌ | Apenas o criador do ticket pode usar este botão!", ephemeral: true });
            }

            await interaction.update({ components: [] });
            
            const staffRole = general.get("ticket.definicoes.cargostaff");
            const staffMention = staffRole ? `<@&${staffRole}>` : (owner ? `<@${owner}>` : "Equipe");

            if (interaction.channel.isThread()) {
                await interaction.channel.members.remove(interaction.user.id);
                const linhaAcoes = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('fecharticket').setStyle(4).setEmoji("1246953338541441036")
                );
                const embed = new EmbedBuilder().setAuthor({ name: `${interaction.user.username} - Atendimento Abandonado`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) }).setDescription(`-# O cliente ${interaction.user} saiu do atendimento.\n\n**Observação:** A equipe pode agora fechar e arquivar este tópico.`).setColor("#FF0000").setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() }).setTimestamp();
                await interaction.channel.send({ embeds: [embed], components: [linhaAcoes], content: staffMention });
            } else {
                await interaction.channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: false });
                const linhaAcoes = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('fecharticket').setStyle(4).setEmoji("1246953338541441036")
                );
                const embed = new EmbedBuilder().setAuthor({ name: `${interaction.user.username} - Atendimento Abandonado`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) }).setDescription(`-# O cliente ${interaction.user} abandonou seu atendimento.\n\n**Observação:** A equipe pode agora fechar e deletar este canal.`).setColor("#FF0000").setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() }).setTimestamp();
                await interaction.channel.send({ embeds: [embed], components: [linhaAcoes], content: staffMention });
            }
        }

        if (interaction.isButton() && customId === "fecharticket") {
            const idCanalTicket = interaction.channel.id;
            const channel = interaction.channel;
            const donoTicketId = tickets.get(`${idCanalTicket}.dono`);
            const idCargoStaff = general.get("ticket.definicoes.cargostaff");

            if (owner === interaction.user.id || (idCargoStaff && interaction.member.roles.cache.has(idCargoStaff))) {
                await interaction.reply({ content: '`✅ | Fechando o ticket em 5 segundos...`', ephemeral: true });
                const nomeFuncao = tickets.get(`${interaction.channel.id}.nmfunc`) || "Não Definido";
                const ticketOwnerMember = donoTicketId ? await interaction.guild.members.fetch(donoTicketId).catch(() => null) : null;
                // Sistema de transcript simplificado para evitar erros React
                let filePath = null;
                try {
                    // Tentativa de criar transcript HTML (pode falhar)
                    const transcript = await discordTranscripts.createTranscript(interaction.channel, { 
                        limit: 50, 
                        returnType: 'string', 
                        saveImages: false, 
                        footerText: `Ark Solutions`, 
                        poweredBy: false,
                        hydrate: false
                    });
                    filePath = path.join(transcriptsDir, `transcript-${idCanalTicket}.html`);
                    fs.writeFileSync(filePath, transcript);
                } catch (error) {
                    console.log('Transcript HTML falhou, criando versão texto simples');
                    // Fallback: transcript em texto simples
                    const messages = await interaction.channel.messages.fetch({ limit: 50 });
                    const simpleTranscript = messages.reverse().map(msg => {
                        const timestamp = msg.createdAt.toLocaleString('pt-BR');
                        const author = msg.author.username;
                        const content = msg.content || '[Anexo/Embed]';
                        return `[${timestamp}] ${author}: ${content}`;
                    }).join('\n');
                    
                    filePath = path.join(transcriptsDir, `transcript-${idCanalTicket}.txt`);
                    fs.writeFileSync(filePath, `Transcript do Ticket ${idCanalTicket}\nCriado em: ${new Date().toLocaleString('pt-BR')}\n\n${simpleTranscript}`);
                }

                const embedLogs = new EmbedBuilder().setAuthor({ name: `${interaction.guild.name} - Logs Sistema` }).setDescription(`-# \Logs do sistema de atendimento.`).addFields(
                    { name: `📜 | Opção`, value: `\`${nomeFuncao}\`` }, { name: `👤 | Criado Por`, value: `\`${ticketOwnerMember ? ticketOwnerMember.user.username : "Não encontrado."}\`` },
                    { name: `🛠 | Atendido Por`, value: `\`${tickets.get(`${idCanalTicket}.assumido`) || "Nenhum."}\`` }, { name: `🎫 | Ticket`, value: `${channel.name}` }, { name: `🔒 | Fechado Por`, value: `${interaction.user}` }
                ).setColor("#FF0000").setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() }).setTimestamp();
                
                const transcriptButton = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Transcript").setStyle(3).setEmoji("1303147982375485521").setCustomId(`downloadTranscript-${idCanalTicket}`));
                const logsChannelId = general.get("ticket.definicoes.logsstaff");
                const logsChannel = logsChannelId ? client.channels.cache.get(logsChannelId) : null;
                if (logsChannel) { await logsChannel.send({ embeds: [embedLogs], components: [transcriptButton] }); }

                if (ticketOwnerMember) {
                    const embedDM = new EmbedBuilder().setDescription(`Olá **${ticketOwnerMember.user.username}**, o seu ticket foi fechado. Aqui está o link para o download do seu transcript.`).setColor("#00FF00").setFooter({ text: `Ticket fechado | ${interaction.guild.name}` }).setTimestamp();
                    try {
                        await ticketOwnerMember.send({ embeds: [embedDM], components: [transcriptButton] });
                    } catch (error) {
                        console.error(`[FALHA NA DM] Fechar ticket para ${ticketOwnerMember.user.tag}: ${error.code}`);
                        if (logsChannel) logsChannel.send(`⚠️ **Aviso:** Não foi possível enviar a DM de fechamento para o usuário ${ticketOwnerMember}. (Erro: ${error.code})`);
                    }
                }
                
                setTimeout(async () => {
                    tickets.delete(idCanalTicket);
                    await channel.delete().catch(err => console.error("Não foi possível deletar o canal do ticket:", err));
                }, 5000);
            } else { return interaction.reply({ content: "❌ | Apenas a equipe pode fechar este ticket!", ephemeral: true }); }
        }
        
        if (interaction.isButton() && customId.startsWith("downloadTranscript-")) {
            const idCanalTicket = customId.split("-")[1];
            const htmlPath = path.join(transcriptsDir, `transcript-${idCanalTicket}.html`);
            const txtPath = path.join(transcriptsDir, `transcript-${idCanalTicket}.txt`);
            
            try {
                let filePath = null;
                let fileName = null;
                
                if (fs.existsSync(htmlPath)) {
                    filePath = htmlPath;
                    fileName = `transcript-${idCanalTicket}.html`;
                } else if (fs.existsSync(txtPath)) {
                    filePath = txtPath;
                    fileName = `transcript-${idCanalTicket}.txt`;
                }
                
                if (filePath) {
                    await interaction.user.send({ 
                        content: `Olá ${interaction.user} Faça o **download** do transcript do ticket abaixo.`, 
                        files: [{ attachment: filePath, name: fileName }] 
                    });
                    await interaction.reply({ content: `\`✅ Transcript enviado em sua DM.\``, ephemeral: true });
                } else { 
                    await interaction.reply({ content: '`❌ O transcript não foi encontrado.`', ephemeral: true }); 
                }
            } catch (error) {
                console.error('Erro ao enviar transcript:', error);
                await interaction.reply({ content: '`❌ Erro ao enviar o transcript. Verifique se suas DMs estão abertas.`', ephemeral: true });
            }
        }
        
        if (interaction.isButton() && customId === "painelstaff") {
            const idCargoStaff = general.get("ticket.definicoes.cargostaff");
            if (owner === interaction.user.id || (idCargoStaff && interaction.member.roles.cache.has(idCargoStaff))) {
                const functions = general.get("ticket.functions") || {};
                const options = [
                    { label: 'Criar Call', value: 'criar_call', emoji: '1302021790599479356' },
                    { label: 'Gerenciar Call', value: 'gerenciarcall', emoji: '1302020493779402872' }
                ];
                if (functions.poker) options.push({ label: 'Notificar Membro', value: 'painelstaffpoker', emoji: '1302020863339663370' });
                if (functions.renomear) options.push({ label: 'Renomear Ticket', value: 'renomear_342345ticket432', emoji: '1246953149009367173' });
                if (functions.adicionar_usuario) options.push({ label: 'Adicionar Usuário', value: 'adicionar_usuario', emoji: '1246953350067388487' });
                if (functions.remover_usuario) options.push({ label: 'Remover Usuário', value: 'remover_usuario', emoji: '1218967523349889057' });
                const row = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('painelstaff2024').setPlaceholder('Opções Disponíveis').addOptions(options));
                await interaction.reply({ components: [row], ephemeral: true });
            } else { return interaction.reply({ content: "`❌ | Apenas a equipe pode usar este painel.`", ephemeral: true }); }
        }
        
        if (interaction.isStringSelectMenu() && customId === 'painelstaff2024') {
            const selectedValue = values[0];

            if (selectedValue === "criar_call") {
                const selectMenu = new ChannelSelectMenuBuilder().setCustomId('selecionarcategoriacriarcall2024').setPlaceholder('Selecione uma categoria').setChannelTypes([ChannelType.GuildCategory]);
                await interaction.reply({ content: '🟢 | Selecione a categoria onde a call será criada.', components: [new ActionRowBuilder().addComponents(selectMenu)], ephemeral: true });
            }

            if (selectedValue === "gerenciarcall") {
                const donoTicketId = tickets.get(`${interaction.channel.id}.dono`);
                const yyy = donoTicketId ? await interaction.guild.members.fetch(donoTicketId).catch(() => null) : null;
                if (!yyy) return interaction.reply({ content: '`❌ | Criador do ticket não encontrado.`', ephemeral: true });

                const existecall = interaction.guild.channels.cache.find(c => c.name === `📞 ・ ${yyy.user.username} ・ ${interaction.channel.id}`);
                if (existecall) {
                    const embed = new EmbedBuilder().setAuthor({ name: `${interaction.guild.name} - Gerenciamento da Call` }).setDescription(`-# Gerenciamento da \`${existecall.name}\`.`).setColor("#4800ff");
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`${existecall.id}_addusuario`).setLabel("Adicionar").setStyle(3).setEmoji("1246953350067388487"),
                        new ButtonBuilder().setCustomId(`${existecall.id}_remusuario`).setLabel("Remover").setStyle(4).setEmoji("1246953338541441036"),
                        new ButtonBuilder().setCustomId(`${existecall.id}_apagar`).setLabel(`Excluir`).setStyle(2).setEmoji("1302020774709952572")
                    );
                    return interaction.update({ embeds: [embed], components: [row], ephemeral: true });
                } else { return interaction.reply({ content: '`❌ | Primeiro crie uma call para usar esta função.`', ephemeral: true }); }
            }
            
            if (selectedValue === "remover_usuario") {
                const modal = new ModalBuilder().setCustomId('removerUsuarioModal').setTitle('Remover Usuário do Ticket');
                modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('userIdInput').setLabel('ID do usuário a ser removido').setStyle(TextInputStyle.Short).setRequired(true)));
                await interaction.showModal(modal);
            }
            
            if (selectedValue === "adicionar_usuario") {
                const userSelect = new UserSelectMenuBuilder().setCustomId('userSelectMenu2443434').setPlaceholder('Selecione até 8 usuários').setMinValues(1).setMaxValues(8);
                await interaction.reply({ content: "`👥 | Selecione os usuários para adicionar ao ticket:`", components: [new ActionRowBuilder().addComponents(userSelect)], ephemeral: true });
            }

            if (selectedValue === "renomear_342345ticket432") {
                const modal = new ModalBuilder().setCustomId('renomearTicketModal').setTitle('Renomear Ticket');
                modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('ticketNameInput').setLabel('Novo nome do ticket').setStyle(TextInputStyle.Short).setRequired(true)));
                await interaction.showModal(modal);
            }
            
            if (selectedValue === "painelstaffpoker") {
                const ticketOwnerId = tickets.get(`${interaction.channel.id}.dono`);
                const ticketOwner = ticketOwnerId ? await interaction.guild.members.fetch(ticketOwnerId).catch(() => null) : null;
                if (!ticketOwner) return interaction.reply({ content: "`❌ | Não foi possível encontrar o criador do ticket.`", ephemeral: true });
                
                const embed = new EmbedBuilder().setTitle("Notificação").setDescription(`Olá ${ticketOwner}, um membro da equipe (${interaction.user}) está chamando você no seu ticket.`).setColor("#4800ff").setTimestamp();
                const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setURL(interaction.channel.url).setLabel("Ir ao Ticket").setEmoji("1246953471111069786").setStyle(5));
                
                try {
                    await ticketOwner.send({ embeds: [embed], components: [row] });
                    await interaction.reply({ content: "`✅ | Usuário notificado com sucesso!`", ephemeral: true });
                } catch (error) {
                    await interaction.reply({ content: "`⚠️ | O usuário desativou as mensagens privadas.`", ephemeral: true });
                }
            }
        }
        
        if (interaction.isButton() && customId === "paymentTicketClick") {
            const sistemaMp = await general.get("auto.sistemaMp") || false;
            const mp = await general.get("auto.mp") || null;
            const sistemaSemi = await general.get("semi.sistema") || false;
            const chave = await general.get("semi.chave") || null;
            if (!sistemaMp && !sistemaSemi) return interaction.reply({ content: `❌ | Nenhuma forma de pagamento ativa no momento.`, ephemeral: true });
            if (!mp && !chave) return interaction.reply({ content: `❌ | Nenhuma forma de pagamento configurada.`, ephemeral: true });
            interaction.reply({ content: `Qual será a forma de pagamento?`, components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`automaticPay`).setLabel(`Automático`).setEmoji(`1256808767325081683`).setStyle(1).setDisabled(!sistemaMp),
                new ButtonBuilder().setCustomId(`semiAutoPay`).setLabel(`Semi-Auto`).setEmoji(`1302020615192187031`).setStyle(1).setDisabled(!sistemaSemi)
            )], ephemeral: true });
        }

        // --- BOTÃO DE ASSUMIR TICKET ---
        if (interaction.isButton() && customId === "assumirticket") {
            const idCanalTicket = interaction.channel.id;
            const donoTicketId = tickets.get(`${idCanalTicket}.dono`);
            const idCargoStaff = general.get("ticket.definicoes.cargostaff");
            if (tickets.get(`${idCanalTicket}.assumido`)) return interaction.reply({ content: '`❌ | Este ticket já foi assumido.`', ephemeral: true });

            if (owner === interaction.user.id || (idCargoStaff && interaction.member.roles.cache.has(idCargoStaff))) {
                const ticketOwnerMember = donoTicketId ? await interaction.guild.members.fetch(donoTicketId).catch(() => null) : null;
                if (!ticketOwnerMember) return interaction.reply({ content: '`❌ | Não foi possível encontrar o criador do ticket.`', ephemeral: true });
                
                const dmEmbed = new EmbedBuilder().setDescription(`Olá ${ticketOwnerMember}, seu ticket em **${interaction.guild.name}** foi assumido pelo staff ${interaction.user}.`).setColor("#4800ff");
                const dmRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setURL(interaction.channel.url).setLabel("Ir ao Ticket").setEmoji("1258516598172418148").setStyle(5));
                
                try {
                    await ticketOwnerMember.send({ embeds: [dmEmbed], components: [dmRow] });
                } catch (error) {
                    console.error(`[FALHA NA DM] Assumir ticket para ${ticketOwnerMember.user.tag}: ${error.code}`);
                    interaction.channel.send(`⚠️ Não foi possível notificar o usuário ${ticketOwnerMember} por DM.`).catch(console.error);
                }

                tickets.set(`${idCanalTicket}.assumido`, interaction.user.username);
                tickets.set(`${idCanalTicket}.assumidostatus`, true);
                
                const nomefuncao = tickets.get(`${idCanalTicket}.nmfunc`) || "Não definido";
                const embedTicket = new EmbedBuilder().setAuthor({ name: `${interaction.guild.name} - Atendimento` }).setTitle(`Atendimento: ${nomefuncao}`)
                    .setDescription(`-# Olá ${ticketOwnerMember}, a equipe já está cuidando do seu caso.`).addFields(
                        { name: `📜 | Opção`, value: `\`${nomefuncao}\``, inline: true }, { name: `👤 | Criado Por`, value: `\`${ticketOwnerMember.user.username}\``, inline: true },
                        { name: `🛠 | Staff Responsável`, value: `\`${interaction.user.username}\``, inline: true }
                    ).setColor("#00FF00").setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() }).setTimestamp();
                
                const linhaAcoesAtualizada = ActionRowBuilder.from(interaction.message.components[0]);
                linhaAcoesAtualizada.components.forEach(comp => { if (comp.data.custom_id === 'assumirticket') comp.setDisabled(true); });
                const linhaAcoes2 = ActionRowBuilder.from(interaction.message.components[1]);

                await interaction.update({ embeds: [embedTicket], components: [linhaAcoesAtualizada, linhaAcoes2] });
            } else { return interaction.reply({ content: "`❌ | Somente a equipe pode assumir este ticket.`", ephemeral: true }); }
        }

        if ((interaction.isButton() && customId.startsWith("ticket_")) || (interaction.isStringSelectMenu() && values[0].startsWith("ticket_"))) {
            // Verificar se o sistema de tickets está ativo
            const statusTicket = general.get("ticket.status") || false;
            if (!statusTicket) {
                return interaction.reply({ 
                    content: `❌ | O sistema de tickets está **desativado** no momento. Entre em contato com a administração.`, 
                    ephemeral: true 
                });
            }

            const nomeFuncao = interaction.isStringSelectMenu() ? values[0].replace("ticket_", "") : customId.replace("ticket_", "");
            const usuario = interaction.user;
            const ticketExistente = interaction.guild.channels.cache.find(c => tickets.get(`${c.id}.dono`) === usuario.id);
            if (ticketExistente) {
                const botao = new ButtonBuilder().setLabel("Ir para o Ticket").setStyle(5).setURL(ticketExistente.url);
                return interaction.reply({ content: `⚠️ | Você já possui um ticket aberto em ${ticketExistente}!`, components: [new ActionRowBuilder().addComponents(botao)], ephemeral: true });
            }
            await interaction.deferReply({ ephemeral: true });
            await criarTicket(interaction, client, usuario, nomeFuncao);
        }
    }
};

async function criarTicket(interaction, client, usuario, nomeFuncao) {
    const categoriaTicket = general.get("ticket.definicoes.categoriaticket");
    const cargoStaff = general.get("ticket.definicoes.cargostaff");
    const statusAberturaTopico = general.get("ticket.statusabertura") || false;
    if (!categoriaTicket || !cargoStaff) return interaction.editReply({ content: "`❌ | A categoria ou cargo de staff não estão configurados.`" });
    
    let canal;
    const nomeDoCanal = `🎫・${usuario.username}・${nomeFuncao}`.substring(0, 100);
    try {
        if (statusAberturaTopico) {
            canal = await interaction.channel.threads.create({ name: nomeDoCanal, type: ChannelType.PrivateThread, autoArchiveDuration: ThreadAutoArchiveDuration.OneDay, reason: `Ticket de ${usuario.username}` });
        } else {
            canal = await interaction.guild.channels.create({ name: nomeDoCanal, type: ChannelType.GuildText, parent: categoriaTicket,
                permissionOverwrites: [
                    { id: interaction.guild.roles.everyone, deny: ["ViewChannel"] }, { id: usuario.id, allow: ["ViewChannel", "SendMessages", "AttachFiles", "ReadMessageHistory"] },
                    { id: cargoStaff, allow: ["ViewChannel", "SendMessages", "AttachFiles", "ReadMessageHistory"] }
                ]
            });
        }
    } catch (error) {
        console.error("Erro ao criar ticket:", error);
        return interaction.editReply({ content: "`❌ | Erro ao criar o canal do ticket. Verifique as permissões do bot.`" });
    }
    tickets.set(`${canal.id}.dono`, usuario.id);
    tickets.set(`${canal.id}.nmfunc`, nomeFuncao);
    tickets.set(`${canal.id}.assumidostatus`, false);

    const embed = new EmbedBuilder().setAuthor({ name: `${interaction.guild.name} - Atendimento ao cliente` }).setTitle(`Atendimento: ${nomeFuncao}`)
        .setDescription(`-# \`👋\` Olá ${usuario}, a equipe de **atendimento** já foi informada da abertura do seu ticket.`).addFields(
            { name: `📜 | Opção `, value: `\`${nomeFuncao}\``, inline: true }, { name: `👤 | Criado Por`, value: `\`${usuario.username}\``, inline: true }
        ).setColor("#4800ff").setThumbnail(usuario.displayAvatarURL({ dynamic: true })).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() }).setTimestamp();
    
    const linhaAcoes1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('sairticket').setLabel("Sair do ticket").setStyle(2).setEmoji("1302020774709952572"),
        new ButtonBuilder().setCustomId('assumirticket').setLabel("Assumir").setStyle(1).setEmoji("1302020615192187031"),
        new ButtonBuilder().setCustomId('painelstaff').setLabel("Painel Staff").setStyle(1).setEmoji("1246955036433453259")
    );
    const linhaAcoes2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('paymentTicketClick').setLabel("Pagamentos").setStyle(3).setEmoji("1302019727471804416"),
        new ButtonBuilder().setCustomId('fecharticket').setLabel(`Deletar`).setStyle(4).setEmoji("1246953338541441036")
    );

    await canal.send({ content: `<@&${cargoStaff}> - ${usuario}.`, embeds: [embed], components: [linhaAcoes1, linhaAcoes2] });
    const botaoIrTicket = new ButtonBuilder().setLabel("Ir para o Ticket").setStyle(5).setURL(canal.url);
    await interaction.editReply({ content: `\`✅ | Ticket criado com sucesso!\``, components: [new ActionRowBuilder().addComponents(botaoIrTicket)], ephemeral: true });
}