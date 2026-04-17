const { ApplicationCommandType } = require("discord.js");
const { owner } = require("../../config.json")
const { config } = require("../../Functions/painel")


module.exports = {
    name:"panel", 
    description:"[ 🟢 ] Painel principal", 
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => { 

        if(interaction.user.id !== owner ) {
            return interaction.reply({ content: '❌ | Você não tem permissão para utilizar este comando', ephemeral: true })
        }

        config(interaction, client)

    }
};