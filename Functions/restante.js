const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { general } = require("../DataBaseJson");

// Nenhuma alteração nesta função
async function configbotao(interaction, client) {
    const config = general.get("ticket.botao") || [];
    const row24 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel("Button Preview")
            .setCustomId("configbotaoteste2024random")
            .setEmoji(config.emoji || "1240863968042418247")
            .setStyle(config.style || 2)
            .setDisabled(true)
    );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("configemojibotao")
            .setLabel("Emoji Button")
            .setEmoji("1352729411149103206")
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId("configcorbotao")
            .setLabel("Style Button")
            .setEmoji("1352729419365744670")
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId("configaparencia")
            .setEmoji("1352729366328508507")
            .setStyle(2)
    );

    interaction.update({
        content: `O que deseja personalizar no botão de atendimento?`,
        components: [row24, row],
        ephemeral: true
    });
}

// --- FUNÇÃO MODIFICADA ---
async function configinteligenciaartifial(interaction, client) {
    const status = general.get("ticket.statusgermine") || false;
    const prompt = general.get("ticket.germine.prompt") || "🔴 Não configurado.";
    const apiKey = general.get("ticket.germine.apikey") || "🔴 Não configurada.";

    // Mascara a chave de API para segurança
    const maskedApiKey = apiKey.startsWith("gsk_") ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : apiKey;

    const embed4 = new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name} - Assistente Virtual ( IA )` })
        .setDescription(`-# Olá ${interaction.user}, Bem-vindo ao Painel de Gerenciamento da sua Assistente Virtual ( IA ).`)
        .setColor("#4800ff")
        .addFields(
            { name: `AI System:`, value: `${status ? '🟢 | Online' : '🔴 | Offline'}`, inline: true },
            { name: `API Key Atual:`, value: `\`${maskedApiKey}\``, inline: true },
            { name: `Prompt Atual:`, value: `\`${prompt.length > 1000 ? prompt.substring(0, 1000) + '...' : prompt}\``, inline: false }
        )
        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    // Botões de Ação - Linha 1
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("statusgermine")
            .setLabel(status ? 'Online' : 'Offline')
            .setEmoji(status ? "1236021048470933575" : "1236021106662707251")
            .setStyle(status ? 3 : 4),
        new ButtonBuilder()
            .setCustomId("configurarprompt")
            .setLabel("Configurar Prompt")
            .setEmoji("1352729333952679986")
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId("configurar_apikey") // NOVO BOTÃO
            .setLabel("Alterar API KEY")
            .setEmoji("🔑")
            .setStyle(2)
    );

    // Botões de Ação - Linha 2
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder() // NOVO BOTÃO
            .setLabel("Como pegar sua API Key")
            .setStyle(5) // Estilo Link
            .setURL("https://www.youtube.com/watch?v=Mx0FYk9jDcw")
            .setEmoji("📄"),
        new ButtonBuilder()
            .setCustomId("voltar00")
            .setEmoji("1352729366328508507")
            .setStyle(2)
    );

    interaction.update({
        components: [row, row2], // Duas linhas de botões
        embeds: [embed4],
        ephemeral: true
    });
}

// Nenhuma alteração nesta função
async function configfuncoes(interaction, client) {
    // ... (código original sem alterações)
    const statusRenomear = general.get("ticket.functions.renomear") || false;
    const statusMotivo = general.get("ticket.functions.motivo_ticket") || false;
    const statusRemoverUsuario = general.get("ticket.functions.remover_usuario") || false;
    const statusAdicionarUsuario = general.get("ticket.functions.adicionar_usuario") || false;
    const statusPoker = general.get("ticket.functions.poker") || false;

    const embed4 = new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name} - Funções Ticket` })
        .setDescription(`-# Olá ${interaction.user}, Bem-vindo ao Painel de Gerenciamento das Funções do seu Ticket utilize os botões abaixo para configurar`)
        .setColor("#4800ff")
        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('configuracoesFuncoes')
        .setPlaceholder('Opções Disponíveis')
        .addOptions(
            {
                label: 'Notificar User',
                description: `${statusPoker ? '🟢 Habilitado' : '🔴 Desabilitado'}`,
                emoji: "1302020863339663370",
                value: '4324324432poker',
            },
            {
                label: 'Renomear',
                description: `${statusRenomear ? '🟢 Habilitado' : '🔴 Desabilitado'}`,
                emoji: "1284680830043557888",
                value: '243234renomear',
            },
            {
                label: 'Adicionar Usuário',
                description: `${statusAdicionarUsuario ? '🟢 Habilitado' : '🔴 Desabilitado'}`,
                emoji: "1284680870497620009",
                value: '34242344adicionar_usuario',
            },
            {
                label: 'Remover Usuário',
                description: `${statusRemoverUsuario ? '🟢 Habilitado' : '🔴 Desabilitado'}`,
                emoji: "1277488588442828830",
                value: '234234234remover_usuario',
            }
        );

    const row4 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("ticketconfig2024")
            .setEmoji("1352729366328508507")
            .setStyle(2)
    );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    interaction.update({
        components: [row, row4],
        embeds: [embed4],
        ephemeral: true
    });
}

// Nenhuma alteração nesta função
async function painelticket(interaction, client) {
    // ... (código original sem alterações)
    const funcoesConfiguradas = await general.get("ticket.funcoes") || [];

    const tipomsg = general.get("ticket.tipoenviarmsgtckt") || false;
    const statusabertura = general.get("ticket.statusabertura") || false;

    const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name} - Gerenciamento Sistema Ticket` })
        .setDescription(`-# Olá ${interaction.user}, Utilize os botoes abaixo para configurar o sistema do seu Ticket`)
        .addFields(
            { name: `Categorias`, value: `\`x${funcoesConfiguradas.length}\``, inline: true },
            { name: `Abertura`, value: `\`${tipomsg ? "Select Menu" : "Botões"}\``, inline: true },
            { name: `Ticket Mode:`, value: `\`${statusabertura ? "Tópico" : "Categoria"}\``, inline: true }
        )
        .setColor("#4800ff")
        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("add_funcao")
            .setLabel("Adicionar Função")
            .setStyle(3)
            .setEmoji("1352729386377281569"),
        new ButtonBuilder()
            .setCustomId("remover_funcao")
            .setLabel("Remover Função")
            .setStyle(4)
            .setEmoji("1352729389204377680")
            .setDisabled(funcoesConfiguradas.length === 0),
        new ButtonBuilder()
            .setCustomId("editar_funcao")
            .setLabel("Editar Categoria")
            .setStyle(2)
            .setEmoji("1352729419365744670")
            .setDisabled(funcoesConfiguradas.length === 0)
    );

    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("ver_funcoes")
            .setLabel("Ver Categorias")
            .setStyle(2)
            .setDisabled(funcoesConfiguradas.length === 0)
            .setEmoji("1352729397949501470"),
        new ButtonBuilder()
            .setCustomId("postar")
            .setLabel("Postar")
            .setStyle(3)
            .setDisabled(funcoesConfiguradas.length === 0)
            .setEmoji("1352729369264521419"),
        new ButtonBuilder()
            .setCustomId("sincronizar")
            .setLabel("Sincronizar")
            .setStyle(2)
            .setDisabled(funcoesConfiguradas.length === 0)
    );

    const row4 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("trocarselect")
            .setLabel(tipomsg ? "Usar Botão" : "Usar Select")
            .setEmoji("1352729408305102930")
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId("trocaraberturaticket2024")
            .setLabel(statusabertura ? "Mode Tópico" : "Mode Category")
            .setEmoji("1352729438625861764")
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId("ticketconfig2024")
            .setStyle(2)
            .setEmoji("1352729366328508507")
    );

    interaction.update({
        embeds: [embed],
        components: [row2, row3, row4],
        ephemeral: true
    });
}

module.exports = {
    configbotao,
    configinteligenciaartifial,
    configfuncoes,
    painelticket
};