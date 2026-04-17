const { 
    ApplicationCommandType, 
    EmbedBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    ActionRowBuilder, 
    TextInputStyle, 
    ChannelSelectMenuBuilder, 
    ChannelType, 
    ButtonBuilder, 
    RoleSelectMenuBuilder
} = require("discord.js");

const { owner } = require("../../config.json");
const { general, tickets } = require("../../DataBaseJson");
const { config, configuracoes, aparencia } = require("../../Functions/painel");
const { configbotao, configinteligenciaartifial, configfuncoes } = require("../../Functions/restante");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;
        if (!interaction.customId) return;

        // --- INÍCIO DAS NOVAS FUNÇÕES ---

        // Listener para o novo botão "Alterar API KEY"
        if (customId === 'configurar_apikey') {
            const modal = new ModalBuilder()
                .setCustomId('modal_apikey')
                .setTitle('Alterar API Key da Groq');

            const apiKeyInput = new TextInputBuilder()
                .setCustomId('apikey_input')
                .setLabel("Insira a nova API Key")
                .setPlaceholder("A chave geralmente começa com 'gsk_...'")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const actionRow = new ActionRowBuilder().addComponents(apiKeyInput);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        }
        
        // --- FIM DAS NOVAS FUNÇÕES ---

        if (customId === "gerenciaraparencia") {
            const status = general.get("ticket.tipomsg") || false;

            if (status) {
                const modal = new ModalBuilder()
                    .setCustomId('gerenciarContent')
                    .setTitle('Gerenciando Content');

                const contentInput = new TextInputBuilder()
                    .setCustomId('novoContent')
                    .setLabel("Qual a nova Content?")
                    .setValue(general.get("ticket.aparencia.content") || `👌 | Olá, utilize o botão abaixo para abrir um ticket`)
                    .setMaxLength(2500)
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                const bannerInput = new TextInputBuilder()
                    .setCustomId('novoBanner')
                    .setLabel("Qual o novo banner? (Opcional)")
                    .setPlaceholder("https:// (ou digite 'remover' para retirar)")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                const row1 = new ActionRowBuilder().addComponents(contentInput);
                const row2 = new ActionRowBuilder().addComponents(bannerInput);
                
                modal.addComponents(row1, row2);
                await interaction.showModal(modal);

            } else {
                const modal = new ModalBuilder()
                    .setCustomId('gerenciarDesign')
                    .setTitle('Gerenciando Design');

                const tituloInput = new TextInputBuilder()
                    .setCustomId('novoTitulo')
                    .setLabel("Qual o novo título?")
                    .setPlaceholder("Atendimento ao cliente")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const descricaoInput = new TextInputBuilder()
                    .setCustomId('novaDescricao')
                    .setLabel("Qual a nova descrição? (Opcional)")
                    .setPlaceholder("EX: Horário de atendimento - 10:00/00:00")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false);

                const corInput = new TextInputBuilder()
                    .setCustomId('novaCor')
                    .setLabel("Qual a nova cor para Embed? (Opcional)")
                    .setPlaceholder("#000000")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                const bannerInput = new TextInputBuilder()
                    .setCustomId('novoBanner')
                    .setLabel("Qual o novo banner? (Opcional)")
                    .setPlaceholder("https:// (ou digite 'remover' para retirar)")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                const miniaturaInput = new TextInputBuilder()
                    .setCustomId('novaMiniatura')
                    .setLabel("Qual a nova miniatura? (Opcional)")
                    .setPlaceholder("https:// (ou digite 'remover' para retirar)")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                const row1 = new ActionRowBuilder().addComponents(tituloInput);
                const row2 = new ActionRowBuilder().addComponents(descricaoInput);
                const row3 = new ActionRowBuilder().addComponents(corInput);
                const row4 = new ActionRowBuilder().addComponents(bannerInput);
                const row5 = new ActionRowBuilder().addComponents(miniaturaInput);

                modal.addComponents(row1, row2, row3, row4, row5);
                await interaction.showModal(modal);
            }
        }

        // --- Bloco de Modals Organizado ---
        if (interaction.isModalSubmit()) {
            
            // Listener para o envio do Modal com a nova API Key
            if (interaction.customId === 'modal_apikey') {
                const novaApiKey = interaction.fields.getTextInputValue('apikey_input');

                if (!novaApiKey || !novaApiKey.startsWith("gsk_")) {
                    return interaction.reply({
                        content: '❌ | A API Key fornecida é inválida. Ela deve começar com `gsk_`.',
                        ephemeral: true
                    });
                }
                general.set("ticket.germine.apikey", novaApiKey);
                configinteligenciaartifial(interaction, client); // Atualiza o painel para mostrar a nova chave
            }
            
            // Listener para o modal de prompt
            if (interaction.customId === 'promptmodal') {
                const prompt = interaction.fields.getTextInputValue('promptinput');
                general.set("ticket.germine.prompt", prompt);
                configinteligenciaartifial(interaction, client);
            }

            // Listener para o modal de emoji do botão
            if (interaction.customId === 'sgahsahsah') {
                const emoji = interaction.fields.getTextInputValue('sagsayesagmojishashsahsahInput');
                const emojiRegex = /^(\p{Emoji}|<a?:\w+:\d+>)$/u;
                const emojivalido = emojiRegex.test(emoji);
                if (emojivalido) {
                    general.set("ticket.botao.emoji", emoji);
                    configbotao(interaction, client);
                } else {
                    await interaction.reply({
                        content: "`❌ O emoji inserido não é válido. Por favor, insira um emoji padrão ou um emoji válido.`",
                        ephemeral: true
                    });
                }
            }

            // Listeners para os modals de aparência
            if (interaction.customId === 'gerenciarContent') {
                const novoConteudo = interaction.fields.getTextInputValue('novoContent');
                const novoBanner = interaction.fields.getTextInputValue('novoBanner');
                if (novoConteudo) general.set("ticket.aparencia.content", novoConteudo);
                if (novoBanner && novoBanner.toLowerCase() !== 'remover') {
                    if (validarUrlImagem(novoBanner)) {
                        general.set("ticket.aparencia.banner", novoBanner);
                    } else {
                        return interaction.reply({
                            content: '`❌ O banner inserido não é uma URL válida de imagem!`',
                            ephemeral: true
                        });
                    }
                } else if (novoBanner.toLowerCase() === 'remover') {
                    general.delete("ticket.aparencia.banner");
                }
                aparencia(interaction, client);
            }
        
            if (interaction.customId === 'gerenciarDesign') {
                const novoTitulo = interaction.fields.getTextInputValue('novoTitulo');
                const novaDescricao = interaction.fields.getTextInputValue('novaDescricao');
                const novaCor = interaction.fields.getTextInputValue('novaCor');
                const novoBanner = interaction.fields.getTextInputValue('novoBanner');
                const novaMiniatura = interaction.fields.getTextInputValue('novaMiniatura');
                if (novoTitulo) general.set("ticket.aparencia.titulo", novoTitulo);
                if (novaDescricao) general.set("ticket.aparencia.descricao", novaDescricao);
                if (novaCor) general.set("ticket.aparencia.cor", novaCor);
                if (novoBanner && novoBanner.toLowerCase() !== 'remover') {
                    if (validarUrlImagem(novoBanner)) {
                        general.set("ticket.aparencia.banner", novoBanner);
                    } else {
                        return interaction.reply({
                            content: '`❌ O banner inserido não é uma URL válida de imagem!`',
                            ephemeral: true
                        });
                    }
                } else if (novoBanner.toLowerCase() === 'remover') {
                    general.delete("ticket.aparencia.banner");
                }
                if (novaMiniatura && novaMiniatura.toLowerCase() !== 'remover') {
                    if (validarUrlImagem(novaMiniatura)) {
                        general.set("ticket.aparencia.miniatura", novaMiniatura);
                    } else {
                        return interaction.reply({
                            content: '`❌ A miniatura inserida não é uma URL válida de imagem!`',
                            ephemeral: true
                        });
                    }
                } else if (novaMiniatura.toLowerCase() === 'remover') {
                    general.delete("ticket.aparencia.miniatura");
                }
                await interaction.reply({
                    content: '`✅ Mudanças feitas com sucesso!`',
                    ephemeral: true
                });
            }
        }
        
        function validarUrlImagem(url) {
            if (!url) return false;
            const extensoesValidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const urlSemParametros = url.split('?')[0];
            return url.startsWith('https://') && extensoesValidas.some(ext => urlSemParametros.toLowerCase().endsWith(ext));
        }

        if (customId === "alterarcategoriaticket") {
            const channelSelectMenu = new ChannelSelectMenuBuilder()
                .setCustomId("categoriaticket")
                .setPlaceholder("📌 Opções")
                .addChannelTypes(ChannelType.GuildCategory)
                .setMinValues(1)
                .setMaxValues(1)

            const row = new ActionRowBuilder().addComponents(channelSelectMenu);
            const row4 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setCustomId("configuracoes")
                .setEmoji("1352729366328508507")
                .setStyle(2),
            )
            await interaction.update({
                content: "",
                embeds: [],
                components: [row, row4]
            });
        }

        if (customId === "categoriaticket") {
            const categoriaselecionada = interaction.values[0];
            general.set("ticket.definicoes.categoriaticket", categoriaselecionada)
            configuracoes(interaction, client)
        }
        

        if (customId === "alterarlogs") {
            const channelSelectMenu = new ChannelSelectMenuBuilder()
                .setCustomId("canallogs")
                .setPlaceholder("📫 Opções")
                .addChannelTypes(0)
                .setMinValues(1)
                .setMaxValues(1)

            const row = new ActionRowBuilder().addComponents(channelSelectMenu);

            const row4 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setCustomId("configuracoes")
                .setEmoji("1352729366328508507")
                .setStyle(2),
            )
            await interaction.update({
                content: "",
                embeds: [],
                components: [row, row4]
            });
        }

        if (customId === "canallogs") {
            const canalselecionado = interaction.values[0];
            general.set("ticket.definicoes.logsstaff", canalselecionado)
            configuracoes(interaction, client)
        }

        if (customId === "alterarcargostaff") {
            const roleselect2024 = new RoleSelectMenuBuilder()
                .setCustomId("cargostaffs")
                .setPlaceholder("👷 Opções")
                .setMinValues(1)
                .setMaxValues(1)

            const row = new ActionRowBuilder().addComponents(roleselect2024);
            const row4 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setCustomId("configuracoes")
                .setEmoji("1352729366328508507")
                .setStyle(2),
            )
            await interaction.update({
                content: "",
                embeds: [],
                components: [row, row4]
            });
        }

        if (customId === "cargostaffs") {
            const cargoselecionado = interaction.values[0];
            general.set("ticket.definicoes.cargostaff", cargoselecionado)
            configuracoes(interaction, client)
        }

        if (customId === "configemojibotao") {
            const modal = new ModalBuilder()
                .setCustomId('sgahsahsah')
                .setTitle('Configurar Emoji do Botão');
            const emojiInput = new TextInputBuilder()
                .setCustomId('sagsayesagmojishashsahsahInput')
                .setLabel("Insira o emoji para o botão")
                .setPlaceholder("Ex: 😊")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            const row = new ActionRowBuilder().addComponents(emojiInput);
            modal.addComponents(row);
            await interaction.showModal(modal);
        }
        
        if (customId === "configcorbotao") {
            const linhaBotoes = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("cor_azul").setLabel("Azul").setStyle(1),
                new ButtonBuilder().setCustomId("cor_cinza").setLabel("Cinza").setStyle(2),
                new ButtonBuilder().setCustomId("cor_verde").setLabel("Verde").setStyle(3),
                new ButtonBuilder().setCustomId("cor_vermelho").setLabel("Vermelho").setStyle(4),
                new ButtonBuilder().setCustomId("configbotao").setEmoji("1352729366328508507").setStyle(2),
            );
            await interaction.update({
                components: [linhaBotoes],
                content: "",
                ephemeral: true
            });
        }

        if (customId.startsWith("cor_")) {
            let estiloBotao;
            switch (customId) {
                case "cor_azul": estiloBotao = 1; break;
                case "cor_verde": estiloBotao = 3; break;
                case "cor_vermelho": estiloBotao = 4; break;
                case "cor_cinza": estiloBotao = 2; break;
            }
            general.set("ticket.botao.style", estiloBotao);
            configbotao(interaction, client)
        }

        if (customId === "configurarprompt") {
            const modal = new ModalBuilder()
                .setCustomId('promptmodal')
                .setTitle('Configurar Prompt');
            const promptinput = new TextInputBuilder()
                .setCustomId('promptinput')
                .setLabel("Prompt")
                .setPlaceholder("Digite o seu prompt")
                .setValue(general.get("ticket.germine.prompt") || "")
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(4000)
                .setRequired(true);
            const row = new ActionRowBuilder().addComponents(promptinput);
            modal.addComponents(row);
            await interaction.showModal(modal);
        }

        if (interaction.isStringSelectMenu() && interaction.customId === 'configuracoesFuncoes') {
            const selectedFunction = interaction.values[0];
            let statusAtual;
            let path;

            switch (selectedFunction) {
                case '243234renomear': path = "ticket.functions.renomear"; break;
                case '234234234remover_usuario': path = "ticket.functions.remover_usuario"; break;
                case '34242344adicionar_usuario': path = "ticket.functions.adicionar_usuario"; break;
                case '4324324432poker': path = "ticket.functions.poker"; break;
                default:
                    return interaction.reply({
                        content: "`❌ Função inválida.`",
                        ephemeral: true,
                    });
            }
            statusAtual = general.get(path) || false;
            general.set(path, !statusAtual);
            await configfuncoes(interaction, client);
        }
    }
};