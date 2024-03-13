const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js')

const denied = new EmbedBuilder()
    .setColor('#75C7D9')
    .setAuthor({ name: '🤖 Automod System' })
    .setFooter({ text: 'Bot by NitTwit' })
    .setTimestamp()
    .setTitle('Access Denied:')
    .setDescription(`You're not an administrator`)


module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Setup automod for your discord server')
        .addSubcommand(command => command
            .setName('flagged-words')
            .setDescription("Used to block users from saying things they shouldn't"))
        .addSubcommand(command => command
            .setName('spam-messages')
            .setDescription('Block spam messages'))
        .addSubcommand(command => command
            .setName('mention-spam')
            .setDescription('Block mass mentions')
            .addIntegerOption(option => option
                .setName('number')
                .setDescription('Number of mentions required to block a message')
                .setRequired(true)))
        .addSubcommand(command => command
            .setName('keyword')
            .setDescription('block a keyword in the server')
            .addStringOption(option => option
                .setName('keyword')
                .setDescription('Word to block')
                .setRequired(true))),

    async execute(interaction) {

        const { guild, options } = interaction
        const sub = options.getSubcommand()

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ embeds: [denied], ephemeral: true })

        switch (sub) {
            case 'flagged-words':
                await interaction.reply(`<a:load_:1124452445788065905> Loading`)

                const rule = guild.autoModerationRules.create({
                    name: 'flagged words by Flo',
                    creatorId: '1124437696224428163',
                    enabled: true,
                    eventType: 1,
                    triggerType: 4,
                    triggerMetadata:
                    {
                        presets: [1]
                    },
                    actions: [
                        {
                            type: 1,
                            metadata: {
                                channel: interaction.channel,
                                durationSeconds: 10,
                                customMessage: 'Message blocked by Flo automod'
                            }
                        }]
                }).catch(async err => {
                    setTimeout(async () => {
                        await interaction.editReply(`Error: ${err}`)
                    }, 2000)
                })
                setTimeout(async () => {
                    if (rule) {
                        const embed = new EmbedBuilder()
                            .setColor('#75C7D9')
                            .setAuthor({ name: '🤖 Automod System' })
                            .setFooter({ text: 'Bot by NitTwit' })
                            .setTimestamp()
                            .setTitle('✅ Automod rule created successfully!')

                        await interaction.editReply({ content: '', embeds: [embed] })
                    }
                }, 2000)
                break;
            case 'keyword':
                await interaction.reply(`<a:load_:1124452445788065905> Loading`)
                const word = options.getString('keyword')

                const rule2 = guild.autoModerationRules.create({
                    name: 'Block Keywords by Flo',
                    creatorId: '1124437696224428163',
                    enabled: true,
                    eventType: 1,
                    triggerType: 1,
                    triggerMetadata:
                    {
                        keywordFilter: [`${word}`]
                    },
                    actions: [
                        {
                            type: 1,
                            metadata: {
                                channel: interaction.channel,
                                durationSeconds: 10,
                                customMessage: 'Message blocked by Flo automod'
                            }
                        }]
                }).catch(async err => {
                    setTimeout(async () => {
                        await interaction.editReply(`Error: ${err}`)
                    }, 2000)
                })
                setTimeout(async () => {
                    if (rule2) {
                        const embed2 = new EmbedBuilder()
                            .setColor('#75C7D9')
                            .setAuthor({ name: '🤖 Automod System' })
                            .setFooter({ text: 'Bot by NitTwit' })
                            .setTimestamp()
                            .setTitle('✅ Automod rule created successfully!')

                        await interaction.editReply({ content: '', embeds: [embed2] })
                    }
                }, 2000)
                break;
            case 'spam-messages':
                await interaction.reply(`<a:load_:1124452445788065905> Loading`)

                const rule3 = guild.autoModerationRules.create({
                    name: 'prevent spam by Flo',
                    creatorId: '1124437696224428163',
                    enabled: true,
                    eventType: 1,
                    triggerType: 3,
                    triggerMetadata:
                    {
                        //mentionTotalLimit: number
                    },
                    actions: [
                        {
                            type: 1,
                            metadata: {
                                channel: interaction.channel,
                                durationSeconds: 10,
                                customMessage: 'Message blocked by Flo automod'
                            }
                        }]
                }).catch(async err => {
                    setTimeout(async () => {
                        await interaction.editReply(`Error: ${err}`)
                    }, 2000)
                })
                setTimeout(async () => {
                    if (rule3) {
                        const embed3 = new EmbedBuilder()
                            .setColor('#75C7D9')
                            .setAuthor({ name: '🤖 Automod System' })
                            .setFooter({ text: 'Bot by NitTwit' })
                            .setTimestamp()
                            .setTitle('✅ Automod rule created successfully!')

                        await interaction.editReply({ content: '', embeds: [embed3] })
                    }
                }, 2000)
                break;
            case 'mention-spam':
                await interaction.reply(`<a:load_:1124452445788065905> Loading`)
                const num = options.getInteger('number')


                const rule4 = guild.autoModerationRules.create({
                    name: 'prevent spam by Flo',
                    creatorId: '1124437696224428163',
                    enabled: true,
                    eventType: 1,
                    triggerType: 5,
                    triggerMetadata:
                    {
                        mentionTotalLimit: num
                    },
                    actions: [
                        {
                            type: 1,
                            metadata: {
                                channel: interaction.channel,
                                durationSeconds: 10,
                                customMessage: 'Message blocked by Flo automod'
                            }
                        }]
                }).catch(async err => {
                    setTimeout(async () => {
                        await interaction.editReply(`Error: ${err}`)
                    }, 2000)
                })
                setTimeout(async () => {
                    if (rule4) {
                        const embed4 = new EmbedBuilder()
                            .setColor('#75C7D9')
                            .setAuthor({ name: '🤖 Automod System' })
                            .setFooter({ text: 'Bot by NitTwit' })
                            .setTimestamp()
                            .setTitle('✅ Automod rule created successfully!')

                        await interaction.editReply({ content: '', embeds: [embed4] })
                    }
                }, 2000)
                break;
        }
    }
}