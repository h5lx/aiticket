const { ApplicationCommandType, EmbedBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder } = require("discord.js");
const { owner } = require("../../config.json");
const { general } = require("../../DataBaseJson");
const { config, configuracoes, configticket, aparencia } = require("../../Functions/painel");
const { configbotao, configinteligenciaartifial, configfuncoes, painelticket } = require("../../Functions/restante");
const { payments, automatic, semiAuto, setAgenceSemi } = require("../../Functions/payments");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;
        if (!customId) return;

        if (customId === '' && interaction.values.includes('')) { };

        if (customId === "statusticket") {
            const status = general.get("ticket.status");
            const statusset = !status;
            general.set("ticket.status", statusset);
            config(interaction, client);
        };

        if (customId === "statusgermine") {
            const status = general.get("ticket.statusgermine");
            const statusset = !status;
            general.set("ticket.statusgermine", statusset)
            configinteligenciaartifial(interaction, client)
        };

        if (customId === "gerenciatipo") {
            const status = general.get("ticket.tipomsg");
            const statusset = !status;
            general.set("ticket.tipomsg", statusset);
            aparencia(interaction, client);
        };

        if (customId === "configbotao") {
            configbotao(interaction, client);
        };

        
        if (customId === "configuracoes") {
            configuracoes(interaction, client);
        };
    
        if (customId === "voltar00") {
            config(interaction, client);
        };

        if (customId === "ticketconfig2024") {
            configticket(interaction, client);
        };

        if (customId === "configaparencia") {
            aparencia(interaction, client);
        };

        if (customId === "inteligenciaartificial") {
            configinteligenciaartifial(interaction, client);
        };

        if (customId === "funcoesticket") {
            configfuncoes(interaction, client);
        };

        if (customId === "configticket") {
            painelticket(interaction, client);
        };

        if (customId === "chaveReciboConfig") {
            payments(interaction, client);
        };

        if (customId === "automaticConfig") {
            automatic(interaction, client);
        };

        if (customId === "semiAutoConfig") {
            semiAuto(interaction, client);
        };

        if (customId === "resetarconfigs") {
            
            if (await general.get("ticket")) {
                general.delete("ticket");
            } else { };

            if (await general.get("auto")) {
                general.delete("auto");
            } else { };

            if (await general.get("semi")) {
                general.delete("semi");
            } else { };


            await interaction.update({ components: [], embeds: [], content: "\`✅ Configurações resetadas com êxito.\`" })
        }

        
        if (customId === "cancelarresetconfigs") {

            await interaction.update({ content: `\`❌ Resetação cancelada com êxito.\``, embeds: [], components: [] })
        }
    }
};
