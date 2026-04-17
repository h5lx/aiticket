const { EmbedBuilder, ApplicationCommandType } = require('discord.js');
const { general } = require('../DataBaseJson');
const { owner: ownerId } = require('../config.json');

module.exports = {
    name: 'say',
    description: '[ 💬 ] Enviar uma mensagem',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'mensagem',
            description: 'A mensagem que você deseja enviar.',
            type: 3,
            required: true,
        },
        {
            name: 'imagem',
            description: 'O link de uma imagem para incluir na embed (opcional).',
            type: 3,
            required: false,
        }
    ],

    async run(client, interaction) {
        
        const staffRoleId = general.get("ticket.definicoes.cargostaff");
        const isOwner = interaction.user.id === ownerId;
        const isStaff = staffRoleId ? interaction.member.roles.cache.has(staffRoleId) : false;

        if (!staffRoleId && !isOwner) {
            return interaction.reply({
                content: '❌ O cargo de Staff não foi configurado no painel. Apenas o dono do bot pode usar este comando.',
                ephemeral: true
            });
        }
        
        if (!isOwner && !isStaff) {
            return interaction.reply({
                content: '❌ Você não tem permissão para usar este comando. É necessário ser Staff ou o dono do bot.',
                ephemeral: true
            });
        }

        const messageText = interaction.options.getString('mensagem');
        const imageUrl = interaction.options.getString('imagem');

        const embed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setDescription(messageText);

        if (imageUrl) {
            if (imageUrl.match(/\.(jpeg|jpg|gif|png)$/i)) {
                embed.setImage(imageUrl);
            } else {
                return interaction.reply({
                    content: '❌ O link da imagem fornecido não parece ser um URL de imagem válido.',
                    ephemeral: true
                });
            }
        }

        try {
            await interaction.channel.send({ embeds: [embed] });
            await interaction.reply({ content: '✅ Mensagem enviada com sucesso!', ephemeral: true });
        } catch (error) {
            console.error("Erro ao enviar a mensagem com /say:", error);
            await interaction.reply({ content: '❌ Ocorreu um erro ao tentar enviar a mensagem neste canal.', ephemeral: true });
        }
    }
};