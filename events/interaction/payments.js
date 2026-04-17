const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ModalBuilder, TextInputBuilder, Embed } = require("discord.js");
const { payments, automatic, semiAuto, setAgenceSemi } = require("../../Functions/payments");
const { general } = require("../../DataBaseJson");
const mercadopago = require("mercadopago");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;
        if (!customId) return;

        if (customId === "sistemaMpOnOff") {

            const sistemaMp = await general.get("auto.sistemaMp") || false;

            if (sistemaMp) {
                await general.set("auto.sistemaMp", false);
            } else {
                await general.set("auto.sistemaMp", true);
            };

            automatic(interaction, client);

        };

        if (customId === "setAccessToken") {

            const modal = new ModalBuilder()
                .setCustomId(`modalAccessToken`)
                .setTitle(`Alterar Access Token`)

            const option1 = new TextInputBuilder()
                .setCustomId(`access`)
                .setLabel(`QUAL O SEU ACCESS TOKEN?`)
                .setPlaceholder(`APP_USR-000000000000000-XX...`)
                .setStyle("Short")

            const optionx1 = new ActionRowBuilder().addComponents(option1);

            modal.addComponents(optionx1);
            await interaction.showModal(modal);

        };

        if (customId === "modalAccessToken") {
            const access = interaction.fields.getTextInputValue("access");

            try {

                const payment_data = {
                    transaction_amount: parseFloat('10'),
                    description: 'Testando se o token é válido',
                    payment_method_id: 'pix',
                    payer: {
                        email: 'gostfazrequisicaobb@gmail.com',
                        first_name: 'Adilson Lima',
                        last_name: 'de Souza',
                        identification: {
                            type: 'CPF',
                            number: '63186896215',
                        },
                        address: {
                            zip_code: '86063190',
                            street_name: 'Rua Jácomo Piccinin',
                            street_number: '871',
                            neighborhood: 'Pinheiros',
                            city: 'Londrina',
                            federal_unit: 'PR',
                        },
                    },
                };

                mercadopago.configurations.setAccessToken(access);
                await mercadopago.payment.create(payment_data);

            } catch (error) {

                const pc = "https://www.youtube.com/watch?v=w7kyGZUrkVY&t=162s";
                const mobile = "https://www.youtube.com/watch?v=ctwqHp1H0-0";

                await interaction.reply({
                    content: ``,
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: `${interaction.user.username} - Erro Access Token`, iconURL: interaction.user.displayAvatarURL() })
                            .setDescription(`-# \`❌\` Erro na setagem do access token.`)
                            .addFields(
                                { name: `Erro`, value: `\`Access Token Inválido\``, inline: true },
                                { name: `Útil`, value: `\`Assista ao tutorial\``, inline: true }
                            )
                            .setColor(`#FF0000`)
                            .setFooter({ text: `${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL() })
                            .setTimestamp()
                    ],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder().setURL(pc).setLabel(`TUTORIAL ACCESS TOKEN (PC)`).setEmoji(`1302020475760934973`).setStyle(5),
                                new ButtonBuilder().setURL(mobile).setLabel(`TUTORIAL ACCESS TOKEN (MOBILE)`).setEmoji(`1302020475760934973`).setStyle(5)
                            )
                    ],
                    ephemeral: true,
                });

                return;

            };

            await general.set("auto.mp", access);
            automatic(interaction, client);

        };

        if (customId === "setAgenceSemi") {
            setAgenceSemi(interaction, client);
        };

        if (customId === "sistemaSemiOnOff") {

            const sistemaSemi = await general.get("semi.sistema") || false;

            if (sistemaSemi) {
                await general.set("semi.sistema", false);
            } else {
                await general.set("semi.sistema", true);
            };

            semiAuto(interaction, client);

        };

        if (customId === "setConfigSemi") {

            const modal = new ModalBuilder()
                .setCustomId(`modalAgenceSemi`)
                .setTitle(`Agencia Semi Auto`)

            const option1 = new TextInputBuilder()
                .setCustomId(`chave`)
                .setLabel(`QUAL É A SUA CHAVE PIX?`)
                .setPlaceholder(`EX: profissional@gmail.com`)
                .setMaxLength(500)
                .setStyle("Short")

            const option2 = new TextInputBuilder()
                .setCustomId(`tipo`)
                .setLabel(`QUAL O TIPO DA SUA CHAVE PIX?`)
                .setPlaceholder(`EX: Email / Telefone / CPF`)
                .setMaxLength(100)
                .setStyle("Short")

            const optionx1 = new ActionRowBuilder().addComponents(option1);
            const optionx2 = new ActionRowBuilder().addComponents(option2);

            modal.addComponents(optionx1, optionx2);
            await interaction.showModal(modal);

        };

        if (customId === "modalAgenceSemi") {
            const tipo = interaction.fields.getTextInputValue("tipo");
            const chave = interaction.fields.getTextInputValue("chave");

            await general.set("semi.tipo", tipo);
            await general.set("semi.chave", chave);
            setAgenceSemi(interaction, client);

        };

        if (customId === "aprovedRoleSemi") {

            interaction.update({
                content: ``,
                embeds: [],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new RoleSelectMenuBuilder()
                                .setCustomId(`selectRoleAprovedSemi`)
                                .setPlaceholder(`⚡ Selecionar Cargo`)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId(`setAgenceSemi`).setEmoji(`1352729366328508507`).setStyle(2)
                        )
                ]
            });

        };

        if (customId === "selectRoleAprovedSemi") {

            const role = interaction.values[0];

            await general.set("semi.roleAprove", role);
            setAgenceSemi(interaction, client);

        };

        if (customId === "antFraudSet") {

            interaction.update({
                content: ``,
                embeds: [],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                        .setCustomId(`selectAntiFraudBanks`)
                        .setPlaceholder(`🏦 Bloquear Banco`)
                        .addOptions(
                            {
                                value: `inter`,
                                label: `Banco: Inter`,
                                emoji: `1217525001171763331`
                            },
                            {
                                value: `picpay`,
                                label: `Banco: PicPay`,
                                emoji: `1217525250464550973`
                            },
                            {
                                value: `nubank`,
                                label: `Banco: NuBank`,
                                emoji: `1217524985766215691`
                            },
                            {
                                value: `99pay`,
                                label: `Banco: 99Pay`,
                                emoji: `1217586613480198254`
                            },
                            {
                                value: `pagseguro`,
                                label: `Banco: PagBank`,
                                emoji: `1217524953860280370`
                            }
                        )
                        .setMaxValues(5)
                    ),
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId(`liberarTudo`).setLabel(`Liberar Tudo`).setEmoji(`1246953338541441036`).setStyle(4),
                        new ButtonBuilder().setCustomId(`automaticConfig`).setEmoji(`1352729366328508507`).setStyle(2)
                    )
                ]
            });

        };

        if (customId === "selectAntiFraudBanks") {

            const options = interaction.values;
            
            await general.set("auto.banksOff", options);
            automatic(interaction, client);

        };

        if (customId === "liberarTudo") {

            await general.set("auto.banksOff", []);
            automatic(interaction, client);

        };

    }
}