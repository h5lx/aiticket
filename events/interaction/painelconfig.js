const { 
    ModalBuilder, 
    TextInputBuilder, 
    ActionRowBuilder, 
    TextInputStyle, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    EmbedBuilder, 
    ChannelSelectMenuBuilder 
} = require("discord.js");

const { general } = require("../../DataBaseJson");
const { painelticket } = require("../../Functions/restante");

// Função para validar o emoji
const emojiRegex = /^<a?:\w+:\d+>$|^\p{Emoji}$/u;
const emojiValido = (emoji) => {
    return emoji ? emojiRegex.test(emoji) : true;
};

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;
        if (!customId) return;

        if (customId === "trocaraberturaticket2024") {
            const status = general.get("ticket.statusabertura") || false;
            const resultado = !status;
            general.set("ticket.statusabertura", resultado);
            painelticket(interaction, client);
        }

        if (customId === "add_funcao") {
            const modal = new ModalBuilder()
                .setCustomId('modal_add_funcao')
                .setTitle('Adicionar função');

            const nomeFuncao = new TextInputBuilder()
                .setCustomId('nome_funcao')
                .setLabel('Nome da Função')
                .setPlaceholder('Insira aqui um nome, como: Suporte')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const preDescricao = new TextInputBuilder()
                .setCustomId('pre_descricao')
                .setLabel('Pré Descrição')
                .setPlaceholder('Insira aqui uma pré descrição, ex: "Preciso de suporte."')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const descricao = new TextInputBuilder()
                .setCustomId('descricao_funcao')
                .setLabel('Descrição')
                .setPlaceholder('Insira aqui a descrição da função.')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            const emojiFuncao = new TextInputBuilder()
                .setCustomId('emoji_funcao')
                .setLabel('Emoji da Função (Opcional)')
                .setPlaceholder('Insira um nome ou ID de um emoji do servidor.')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const modalRow1 = new ActionRowBuilder().addComponents(nomeFuncao);
            const modalRow2 = new ActionRowBuilder().addComponents(preDescricao);
            const modalRow3 = new ActionRowBuilder().addComponents(descricao);
            const modalRow5 = new ActionRowBuilder().addComponents(emojiFuncao);

            modal.addComponents(modalRow1, modalRow2, modalRow3, modalRow5);

            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'modal_add_funcao') {
            const nome = interaction.fields.getTextInputValue('nome_funcao');
            const preDescricao = interaction.fields.getTextInputValue('pre_descricao');
            const descricao = interaction.fields.getTextInputValue('descricao_funcao') || "Sem descrição.";
            let emoji = interaction.fields.getTextInputValue('emoji_funcao') || null;

            // Validação do emoji
            if (!emojiValido(emoji)) {
                return interaction.reply({
                    content: "\`❌ O emoji inserido não é válido. Use um emoji padrão ou o ID de um emoji válido.\`",
                    ephemeral: true
                });
            }

            const funcao = {
                nome,
                preDescricao,
                descricao,
                emoji,
                status: true
            };

            let funcoes = general.get("ticket.funcoes") || [];
            if (funcoes.length >= 25) {
                return interaction.reply({
                    content: "\`❌ Você atingiu o limite de 25 Categorias.\`",
                    ephemeral: true
                });
            }

            funcoes.push(funcao);
            general.set("ticket.funcoes", funcoes);

            await painelticket(interaction, client);
        }

        if (customId === "remover_funcao") {
            const funcoes = general.get("ticket.funcoes") || [];

            if (funcoes.length === 0) {
                return interaction.update({
                    content: "\`❌ Nenhuma função configurada para remover.\`",
                    ephemeral: true
                });
            }

            const options = funcoes.map(funcao => ({
                label: funcao.nome,
                description: funcao.preDescricao,
                value: funcao.nome,
                ...(funcao.emoji ? { emoji: funcao.emoji } : {})
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("select_remover_funcao")
                .setPlaceholder("Selecione uma função para remover")
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.update({
                content: "Qual categoria deseja deletar?",
                components: [row],
                embeds: [],
                ephemeral: true
            });
        }

        if (customId === "select_remover_funcao") {
            const nomeFuncao = interaction.values[0];
            let funcoes = general.get("ticket.funcoes") || [];

            funcoes = funcoes.filter(funcao => funcao.nome !== nomeFuncao);
            general.set("ticket.funcoes", funcoes);

            await painelticket(interaction, client);
        }

        if (customId === "editar_funcao") {
            const funcoes = general.get("ticket.funcoes") || [];

            if (funcoes.length === 0) {
                return interaction.reply({
                    content: "\`❌ Nenhuma função configurada para editar.\`",
                    ephemeral: true
                });
            }

            const options = funcoes.map(funcao => ({
                label: funcao.nome,
                description: funcao.preDescricao,
                value: funcao.nome,
                ...(funcao.emoji ? { emoji: funcao.emoji } : {})
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("select_editar_funcao")
                .setPlaceholder("Clique aqui para ver as categorias")
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({
                content: "Qual função deseja editar?",
                components: [row],
                embeds: [],
                ephemeral: true
            });
        }

        if (customId === "select_editar_funcao") {
            const nomeFuncao = interaction.values[0];
            const funcoes = general.get("ticket.funcoes") || [];
            const funcaoSelecionada = funcoes.find(funcao => funcao.nome === nomeFuncao);

            if (!funcaoSelecionada) {
                return interaction.update({
                    content: "\`❌ Função não encontrada.\`",
                    ephemeral: true
                });
            }

            const modal = new ModalBuilder()
                .setCustomId('modal_editar_funcao')
                .setTitle(`Editar função: ${nomeFuncao}`);

            const nomeFuncaoField = new TextInputBuilder()
                .setCustomId('nome_funcao')
                .setLabel('Nome da Função')
                .setValue(funcaoSelecionada.nome || "")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const preDescricaoField = new TextInputBuilder()
                .setCustomId('pre_descricao')
                .setLabel('Pré Descrição')
                .setValue(funcaoSelecionada.preDescricao || "")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const descricaoField = new TextInputBuilder()
                .setCustomId('descricao_funcao')
                .setLabel('Descrição')
                .setValue(funcaoSelecionada.descricao || "")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            const emojiFuncaoField = new TextInputBuilder()
                .setCustomId('emoji_funcao')
                .setLabel('Emoji da Função (Opcional)')
                .setValue(funcaoSelecionada.emoji || "")
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const modalRow1 = new ActionRowBuilder().addComponents(nomeFuncaoField);
            const modalRow2 = new ActionRowBuilder().addComponents(preDescricaoField);
            const modalRow3 = new ActionRowBuilder().addComponents(descricaoField);
            const modalRow5 = new ActionRowBuilder().addComponents(emojiFuncaoField);

            modal.addComponents(modalRow1, modalRow2, modalRow3, modalRow5);

            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'modal_editar_funcao') {
            const nome = interaction.fields.getTextInputValue('nome_funcao');
            const preDescricao = interaction.fields.getTextInputValue('pre_descricao');
            const descricao = interaction.fields.getTextInputValue('descricao_funcao') || "Sem descrição.";
            const emoji = interaction.fields.getTextInputValue('emoji_funcao') || null;

            if (!emojiValido(emoji)) {
                return interaction.update({
                    content: "\`❌ O emoji inserido não é válido. Use um emoji padrão ou o ID de um emoji válido.\`",
                    ephemeral: true
                });
            }

            let funcoes = general.get("ticket.funcoes") || [];
            funcoes = funcoes.map(funcao => funcao.nome === nome ? { nome, preDescricao, descricao, emoji, status: funcao.status } : funcao);
            general.set("ticket.funcoes", funcoes);

            await interaction.update({ content: `\`✅ Mudança feita com sucesso!\``, ephemeral: true });
        }

        if (customId === "postar") {
            const selectMenu = new ChannelSelectMenuBuilder()
                .setCustomId("select_channel_postar")
                .setPlaceholder("Selecione o canal para postar")
                .addChannelTypes(0);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({
                content: "Onde deseja setar o painel de ticket?",
                components: [row],
                ephemeral: true
            });
        }

        if (customId === "select_channel_postar") {
            const channelId = interaction.values[0];
            const channel = client.channels.cache.get(channelId);
            const funcoes = general.get("ticket.funcoes") || [];
            const configBotao = general.get("ticket.botao") || { emoji: "1246953296321577020", style: 1 };
            const tipoEnviarMsg = general.get("ticket.tipoenviarmsgtckt") || false;
        
            if (!channel) {
                return interaction.reply({
                    content: "\`❌ Canal inválido.\`",
                    ephemeral: true
                });
            }
        
            let message;
            
            if (tipoEnviarMsg) {
                const options = funcoes.map(funcao => ({
                    label: funcao.nome,
                    description: funcao.preDescricao,
                    value: `ticket_${funcao.nome}`,
                    emoji: funcao.emoji || configBotao.emoji
                }));
        
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId("ticket_select")
                    .setPlaceholder("Selecione as opções abaixo")
                    .addOptions(options);
        
                const row = new ActionRowBuilder().addComponents(selectMenu);
        
                const tipoMensagem = general.get("ticket.tipomsg") || false;
        
                if (tipoMensagem) {
                    let content = general.get("ticket.aparencia.content") || "Selecione uma opção abaixo para abrir ticket";
                    message = await channel.send({ content: content, components: [row] });
                } else {
                    const embed = new EmbedBuilder()
                        .setTitle(general.get("ticket.aparencia.titulo") || "Sistema de Tickets")
                        .setDescription(general.get("ticket.aparencia.descricao") || "Selecione uma função no menu abaixo para abrir um ticket.")
                        .setColor(general.get("ticket.aparencia.cor") || "#000000")
                        .setImage(general.get("ticket.aparencia.banner") || null)
                        .setThumbnail(general.get("ticket.aparencia.miniatura") || null)
                        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                        .setTimestamp();
        
                    message = await channel.send({ embeds: [embed], components: [row] });
                }
        
            } else {
                const buttons = funcoes.slice(0, 25).map(funcao => {
                    return new ButtonBuilder()
                        .setCustomId(`ticket_${funcao.nome}`)
                        .setLabel(funcao.nome)
                        .setEmoji(funcao.emoji || configBotao.emoji)
                        .setStyle(configBotao.style || 1);
                });

                const rows = [];
                for (let i = 0; i < buttons.length; i += 5) {
                    const row = new ActionRowBuilder().addComponents(buttons.slice(i, i + 5));
                    rows.push(row);
                }
        
                const tipoMensagem = general.get("ticket.tipomsg") || false;
                const banner = general.get("ticket.aparencia.banner") || null;

                if (tipoMensagem) {
                    let content = general.get("ticket.aparencia.content") || "Clique abaixo para abrir um ticket";
                    message = await channel.send({ content: content, components: rows });
                } else {
                    const embed = new EmbedBuilder()
                        .setTitle(general.get("ticket.aparencia.titulo") || "Sistema de Tickets")
                        .setDescription(general.get("ticket.aparencia.descricao") || "Selecione uma função abaixo para abrir um ticket.")
                        .setColor(general.get("ticket.aparencia.cor") || "#000000")
                        .setImage(general.get("ticket.aparencia.banner") || null)
                        .setThumbnail(general.get("ticket.aparencia.miniatura") || null)
                        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                        .setTimestamp();
                          console.dir(rows, { depth: 10 });
                    message = await channel.send({ embeds: [embed], components: rows });
                }
            }
        
            general.set("ticket.mensagemId", message.id);
            general.set("ticket.channelId", channelId);
        
            await interaction.update({
                content: `\`✅\` Ticket postado com sucesso no canal <#${channelId}>!`,
                components: [],
                ephemeral: true
            });
        }

        if (customId === "trocarselect") {
            const atualstatus = general.get("ticket.tipoenviarmsgtckt") || false;
            const resultado = !atualstatus;
            general.set("ticket.tipoenviarmsgtckt", resultado);
            painelticket(interaction, client);
        }
        

        if (customId === "sincronizar") {
            const channelId = general.get("ticket.channelId");
            const mensagemId = general.get("ticket.mensagemId");
            const channel = client.channels.cache.get(channelId);
        
            if (!channel) {
                return interaction.reply({
                    content: "\`❌ O canal salvo não existe mais. Por favor, poste novamente.\`",
                    ephemeral: true
                });
            }
        
            const message = await channel.messages.fetch(mensagemId).catch(() => null);
        
            if (!message) {
                return interaction.reply({
                    content: "\`❌ A mensagem original não foi encontrada. Por favor, poste novamente.\`",
                    ephemeral: true
                });
            }
        
            const funcoes = general.get("ticket.funcoes") || [];
            const configBotao = general.get("ticket.botao") || { emoji: "1246953296321577020", style: 1 };
            const tipoEnviarMsg = general.get("ticket.tipoenviarmsgtckt") || false; 
        
            let row;
        
            if (tipoEnviarMsg) {
                const options = funcoes.map(funcao => ({
                    label: funcao.nome,
                    description: funcao.preDescricao,
                    value: `ticket_${funcao.nome}`,
                    emoji: funcao.emoji || configBotao.emoji
                }));
        
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId("ticket_select")
                    .setPlaceholder("Clique aqui para ver as opções de atendimento")
                    .addOptions(options);
        
                row = new ActionRowBuilder().addComponents(selectMenu);
        
            } else {
                const buttons = funcoes.slice(0, 25).map(funcao => {
                    return new ButtonBuilder()
                        .setCustomId(`ticket_${funcao.nome}`)
                        .setLabel(funcao.nome)
                        .setEmoji(funcao.emoji || configBotao.emoji)
                        .setStyle(configBotao.style || 1);
                });
        
                const rows = [];
                for (let i = 0; i < buttons.length; i += 5) {
                    const row = new ActionRowBuilder().addComponents(buttons.slice(i, i + 5));
                    rows.push(row);
                }
                row = rows;
            }
        
            const tipoMensagem = general.get("ticket.tipomsg") || false;
        
            if (tipoMensagem) {
                let content = general.get("ticket.aparencia.content") || "Clique abaixo para abrir um ticket";
                await message.edit({ content: content, embeds: [], components: Array.isArray(row) ? row : [row] });
            } else {
                const embed = new EmbedBuilder()
                    .setTitle(general.get("ticket.aparencia.titulo") || "Sistema de Tickets")
                    .setDescription(general.get("ticket.aparencia.descricao") || "Selecione uma função abaixo para abrir um ticket.")
                    .setColor(general.get("ticket.aparencia.cor") || "#000000")
                    .setImage(general.get("ticket.aparencia.banner") || null)
                    .setThumbnail(general.get("ticket.aparencia.miniatura") || null)
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                    .setTimestamp();
        
                await message.edit({ embeds: [embed], content: "", components: Array.isArray(row) ? row : [row] });
            }
        
            await interaction.reply({
                content: "\`✅ Mensagens sincronizadas com sucesso!\`",
                ephemeral: true
            });
        }
        

        async function verFuncoes(interaction, client) {
            const funcoesConfiguradas = general.get("ticket.funcoes") || [];
        
            if (funcoesConfiguradas.length === 0) {
                return interaction.reply({
                    content: "\`❌ Nenhuma função configurada.\`",
                    ephemeral: true
                });
            }

            const function244 = funcoesConfiguradas.map((funcao, index) => `**${index + 1}.** \`${funcao.emoji ? `${funcao.emoji} - ` : ""}${funcao.nome}\``).join('\n')

        
            await interaction.reply({
                content: `# 📋 Categorias Existentes\n\n${function244}`,
                ephemeral: true
            });
        }

        
        if (customId === "ver_funcoes") {

            verFuncoes(interaction, client)

        }
        
    }
};
