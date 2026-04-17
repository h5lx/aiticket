const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const Groq = require("groq-sdk");
const { general, tickets } = require("../../DataBaseJson");

module.exports = {
    name: "messageCreate",
    run: async (message, client) => {
        if (!message || !client) return;
        if (message.author.bot) return;

        const ticketInfo = tickets.get(`${message.channel.id}`);
        if (!ticketInfo) return;
        
        const apiKey = general.get("ticket.germine.apikey"); // Pega a chave do banco de dados

        const ticketAssumido = tickets.get(`${message.channel.id}.assumido`);
        const statusIA = general.get("ticket.statusgermine");

        if (!statusIA) return;

        const papeisUsuario = message.member.roles.cache;
        const cargoStaff = general.get("ticket.definicoes.cargostaff");
        let ehStaff = false;

        if (Array.isArray(cargoStaff)) {
            ehStaff = cargoStaff.some(role => papeisUsuario.has(role));
        } else if (cargoStaff) {
            ehStaff = papeisUsuario.has(cargoStaff);
        };

        if (!ticketAssumido && ehStaff) {
            tickets.set(`${message.channel.id}.assumido`, true);

            const historicoChat = tickets.get(`${message.channel.id}.chat`) || [];
            let resumoTexto = "Nenhuma conversa registrada até agora.";

            if (historicoChat.length > 0) {
                try {
                    if (!apiKey) throw new Error("API Key da Groq não configurada no banco de dados.");
                    const groq = new Groq({ apiKey }); // Instancia com a chave do DB
                    
                    const respostaResumo = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: "Resuma a conversa do ticket de forma clara para o staff." },
                            ...historicoChat
                        ],
                        model: "llama-3.1-8b-instant",
                        temperature: 0.5,
                        max_tokens: 512,
                    });
                    resumoTexto = respostaResumo.choices[0]?.message?.content || "Não foi possível gerar um resumo.";
                } catch (erro) {
                    console.error("Erro ao gerar resumo do ticket:", erro);
                    resumoTexto = "Erro ao gerar resumo do ticket.";
                }
            }

            // ... (resto do código de embed sem alteração)
            const embedDesligar = new EmbedBuilder()
                .setAuthor({ name: `${message.author.username} - Staff Comandante`, iconURL: `${message.author.displayAvatarURL({ dynamic: true })}` })
                .setDescription(`\`✨\` | Um membro da equipe assumiu o controle!  \n\n- A partir de agora, um **staff** ficará responsável por este atendimento.  \n- Nossa assistente virtual (IA) não responderá mais neste canal.  \n\n\`👮‍♂️\` **Responsável:** ${message.author}  \n\`💬\` Sinta-se à vontade para conversar diretamente com ele!`)
                .setColor("#00FF00")
                .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() })
                .setTimestamp();
            await message.channel.send({ embeds: [embedDesligar], components: [ new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`msgSystem`).setLabel(`Mensagem do Sistema`).setStyle(2).setDisabled(true))] });
            const embedResumo = new EmbedBuilder()
                .setTitle("Resumo do Ticket")
                .setDescription(resumoTexto)
                .setColor("#FFD700")
                .setFooter({ text: `${message.guild.name} - Todos os Direitos Reservados`, iconURL: message.guild.iconURL() })
                .setTimestamp();
            await message.channel.send({ embeds: [embedResumo] });
            return;
        }

        if (ticketAssumido) return;

        if (message.author.id === ticketInfo.dono) {
            if (!apiKey) {
                console.log("A IA não pode responder pois a API Key não foi configurada.");
                return;
            }
            const groq = new Groq({ apiKey }); // Instancia com a chave do DB
            const historicoChat = tickets.get(`${message.channel.id}.chat`) || [];
            const mensagemUsuario = message.content;
            const ultimaMensagem = historicoChat.length > 0 ? historicoChat[historicoChat.length - 1].content : "";
            if (ultimaMensagem === mensagemUsuario) return;
            const promptDoSistema = general.get("ticket.germine.prompt") || `Você é uma assistente de suporte. Responda em português de forma clara e direta ao problema descrito pelo usuário. Se você não souber a resposta, peça para aguardar o suporte humano.`;
            historicoChat.push({ role: 'user', content: mensagemUsuario });
            tickets.set(`${message.channel.id}.chat`, historicoChat);
            await message.channel.sendTyping();
            try {
                const messagesParaAPI = [{ role: 'system', content: promptDoSistema }, ...historicoChat];
                const respostaIA = await groq.chat.completions.create({
                    messages: messagesParaAPI,
                    model: "llama-3.1-8b-instant",
                    temperature: 0.5,
                    max_tokens: 1024,
                });
                const mensagemIA = respostaIA.choices[0]?.message?.content || "Desculpe, não consegui gerar uma resposta agora.";
                await message.reply({ content: mensagemIA });
                historicoChat.push({ role: 'assistant', content: mensagemIA });
                tickets.set(`${message.channel.id}.chat`, historicoChat);
            } catch (erro) {
                console.error("Erro ao processar a resposta da IA:", erro);
                await message.reply({ content: '`❌ Erro ao processar a resposta da IA.`', ephemeral: true });
            }
        }
    }
};