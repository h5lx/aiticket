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
    RoleSelectMenuBuilder,
    PermissionsBitField,
    UserSelectMenuBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

const { owner } = require("../../config.json");
const { general, tickets } = require("../../DataBaseJson");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;
        if (!customId) return;

        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'renomearTicketModal') {
                const channel = interaction.channel;
                const ticketname = interaction.fields.getTextInputValue('ticketNameInput');

                channel.setName(ticketname)
                    .then(() => {
                        interaction.reply({ content: `\`✅ O nome do ticket foi alterado com sucesso para **${ticketname}**\``, ephemeral: true });
                    })
                    .catch(error => {
                        interaction.reply({ content: "\`⚠️ Não foi possível alterar o nome do ticket.\`", ephemeral: true });
                    });
            }
        }



        if (interaction.isUserSelectMenu()) {
            if (interaction.customId === 'userSelectMenu2443434') {
                const channel = interaction.channel;
                const selectedUsers = interaction.values;

                try {
                    if (channel.isThread()) {
                        for (const userId of selectedUsers) {
                            const user = interaction.guild.members.cache.get(userId);
                            if (user) {
                                await channel.members.add(user);
                            }
                        }
                    } else {
                        for (const userId of selectedUsers) {
                            const user = interaction.guild.members.cache.get(userId);
                            if (user) {
                                await channel.permissionOverwrites.create(user, { ViewChannel: true });
                            }
                        }
                    }

                    interaction.update({ content: "`✅ Usuários adicionados ao ticket com sucesso.`", components: [], ephemeral: true });
                } catch (error) {
                    interaction.update({ content: "`⚠️ Ocorreu um erro ao adicionar os usuários ao ticket.`", components: [], ephemeral: true });
                }
            }
        }

        if (interaction.isModalSubmit() && interaction.customId === 'removerUsuarioModal') {
            const channel = interaction.channel;
            const userId = interaction.fields.getTextInputValue('userIdInput');

            try {
                const user = interaction.guild.members.cache.get(userId);

                if (user) {
                    if (channel.isThread()) {
                        await channel.members.remove(userId);
                    } else {
                        await channel.permissionOverwrites.delete(userId);
                    }

                    interaction.reply({ content: "`✅ Usuário removido do ticket com sucesso.`", components: [], ephemeral: true });
                } else {
                    interaction.reply({ content: "`⚠️ Usuário não encontrado.`", components: [], ephemeral: true });
                }
            } catch (error) {
                interaction.reply({ content: "`⚠️ Ocorreu um erro ao remover o usuário do ticket.`", ephemeral: true });
            }
        }


        if (interaction.isChannelSelectMenu() && interaction.customId === 'selecionarcategoriacriarcall2024') {
            const categori24a = interaction.guild.channels.cache.get(interaction.values[0]);
            const donoTicket = tickets.get(`${interaction.channel.id}.dono`);
            const yyy24 = interaction.guild.members.cache.get(donoTicket);
            const cargoStaff = general.get("ticket.definicoes.cargostaff");

            if (!categori24a || categori24a.type !== 4) {
                return interaction.update({ content: '`❌ Categoria não encontrada.`', ephemeral: true });
            }

            const canal2024 = interaction.guild.channels.cache.find(channel =>
                channel.name === `📞 ・ ${yyy24.user.username} ・ ${interaction.channel.id}`
            );

            if (canal2024) {
                return interaction.update({ content: '`❌ Esse Ticket ja tem uma call criada.`', components: [], ephemeral: true });
            }

            try {
                const permissionOverwrites = [
                    {
                        id: interaction.guild.id,
                        allow: [PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
                    },
                    {
                        id: donoTicket,
                        allow: [PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Connect],
                    }
                ];

                if (cargoStaff) {
                    permissionOverwrites.push({
                        id: cargoStaff,
                        allow: [PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.MoveMembers],
                    });
                }

                const voiceChannel = await interaction.guild.channels.create({
                    name: `📞 ・ ${yyy24.user.username} ・ ${interaction.channel.id}`,
                    type: ChannelType.GuildVoice,
                    parent: categori24a,
                    userLimit: 99,
                    permissionOverwrites: permissionOverwrites,
                });

                tickets.set(`${interaction.channel.id}.callvoz`, voiceChannel.id);

                const content = `||${yyy24}${cargoStaff ? ` - <@&${cargoStaff}>` : ``}||`;

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setURL(`https://discord.com/channels/${interaction.guild.id}/${voiceChannel.id}`)
                        .setLabel("Logar na Call")
                        .setEmoji("1302021790599479356")
                        .setStyle(5)
                );

                await interaction.channel.send({
                    content: content,
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: `${interaction.user.username} - Gerenciamento Call Atendimento`, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}` })
                            .setDescription(`-# \`📞\` Gerenciamento da **call atendimento**.\n\n-# **Call Name:** \`${voiceChannel.name}\``)
                            .setFields(
                                { name: `Cliente`, value: `${yyy24 || "\`Não encontrado.\`"}`, inline: true },
                                { name: `Staffs`, value: `${cargoStaff ? `<@&${cargoStaff}>` : `\`Não encontrado.\``}`, inline: true }
                            )
                            .setColor("#00FF00")
                            .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
                            .setTimestamp()
                    ],
                    components: [row]
                });
                return interaction.update({ content: '`✅ Canal de voz criado com êxito.`', components: [], ephemeral: true });
            } catch (error) {
                return interaction.update({ content: '`❌ Não foi possivel criar a call.`', components: [], ephemeral: true });
            };
        }



        if (interaction.isButton() && interaction.customId.includes('_apagar')) {
            const callId = interaction.customId.split('_')[0];
            const channel = interaction.guild.channels.cache.get(callId);

            if (!channel) {
                return interaction.reply({ content: '`❌ Canal De Voz não encontrado.`', ephemeral: true });
            }

            try {
                await channel.delete();
                return interaction.update({ content: '`✅ Canal de voz deletado com sucesso.`', embeds: [], components: [], ephemeral: true });
            } catch (error) {
                return interaction.reply({ content: '`❌ Erro ao deletar a call.`', ephemeral: true });
            }
        }

        if (interaction.isButton() && interaction.customId.includes('_resetarcall')) {
            const callId = interaction.customId.split('_')[0];
            const channel = interaction.guild.channels.cache.get(tickets.get(`${interaction.channel.id}.callvoz`));

            if (!channel) {
                return interaction.reply({ content: '`❌ Canal de voz não encontrado.`', ephemeral: true });
            }

            if (channel.type === ChannelType.GuildVoice) {
                try {
                    const membersToDisconnect = channel.members;

                    if (!membersToDisconnect || membersToDisconnect.size === 0) {
                        return interaction.reply({ content: '`❌ Não há membros na call para remover.`', ephemeral: true });
                    }

                    for (const [memberID, member] of membersToDisconnect) {
                        try {
                            await member.voice.disconnect();
                        } catch (error) {
                        }
                    }

                    return interaction.reply({ content: '`✅ Todos os membros foram removidos da call.`', ephemeral: true });
                } catch (error) {
                    return interaction.reply({ content: '`❌ Erro ao remover os membros da call.`', ephemeral: true });
                }
            } else {
                return interaction.reply({ content: '`❌ O canal selecionado não é um canal de voz.`', ephemeral: true });
            }
        }



        if (interaction.isButton() && interaction.customId.includes('_addusuario')) {
            const callId = interaction.customId.split('_')[0];
            const channel = interaction.guild.channels.cache.get(callId);

            if (!channel) {
                return interaction.reply({ content: '`❌ Canal não encontrado.`', ephemeral: true });
            }

            const userSelectMenu = new ActionRowBuilder().addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId(`${callId}_selectusers`)
                    .setPlaceholder('Selecione até 4 usuários')
                    .setMaxValues(4)
            );

            return interaction.reply({ content: '`👤 Selecione os usuários para adicionar.`', components: [userSelectMenu], ephemeral: true });
        }

        if (interaction.isButton() && interaction.customId.includes('_remusuario')) {
            const callId = interaction.customId.split('_')[0];
            const modal = new ModalBuilder()
                .setCustomId(`${callId}_543245removerUsuarioModal2343254`)
                .setTitle('Remover Usuário')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('userIdInput')
                            .setLabel('ID do Usuário')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Digite o ID do usuário')
                            .setRequired(true)
                    )
                );

            return interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId.includes('_543245removerUsuarioModal2343254')) {
            const userId = interaction.fields.getTextInputValue('userIdInput');
            const callId = interaction.customId.split('_')[0];
            const channel = interaction.guild.channels.cache.get(callId);

            if (!channel) {
                return interaction.reply({ content: '`❌ Canal De Voz não encontrado.`', ephemeral: true });
            }

            try {
                await channel.permissionOverwrites.delete(userId);
                return interaction.reply({ content: '`✅ Permissão de entrar na call removida com sucesso.`', ephemeral: true });
            } catch (error) {
                return interaction.reply({ content: '`❌ Erro ao remover o usuário da call.`', ephemeral: true });
            }
        }

        if (interaction.isUserSelectMenu() && interaction.customId.includes('_selectusers')) {
            const callId = interaction.customId.split('_')[0];
            const channel = interaction.guild.channels.cache.get(callId);

            if (!channel) {
                return interaction.reply({ content: '`❌ Canal não encontrado.`', ephemeral: true });
            }

            const selectedUsers = interaction.values;

            try {
                for (const userId of selectedUsers) {
                    await channel.permissionOverwrites.create(userId, {
                        Connect: true,
                        Speak: true,
                    });
                }
                return interaction.reply({ content: '`✅ Permissão adicionada para os usuarios entrar na call.`', ephemeral: true });
            } catch (error) {
                return interaction.reply({ content: '`❌ Erro ao adicionar os usuários à call.`', ephemeral: true });
            }
        }




    }
};
