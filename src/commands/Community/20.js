const { SlashCommandBuilder, PermissionOverwrites, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js')
const { SkyBlue, Success, Error, Orange } = require('embedstyles')
const qSetup = require('../../Schemas.js/20q')
const twentyQuestions = require('../../Schemas.js/game-20');
const gameProfiles = require('../../Schemas.js/gameProfiles');

function generateId() {
    var randomId = Math.floor(Math.random() * 90000) + 10000;
    return randomId;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('20-questions')
        .setDescription('Game_20-questions')
        .addSubcommand(command => command
            .setName('setup')
            .setDescription('set the catgory and max number of games')
            .addIntegerOption(option => option
                .setName('max_games')
                .setDescription('Set the number of max games in your server')
                .setRequired(true))
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to put games invites')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
            .addChannelOption(option => option
                .setName('category')
                .setDescription('The category to put open games in')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)))
        .addSubcommand(command => command
            .setName('start')
            .setDescription('Start a game of 20 questions')
            .addStringOption(option => option
                .setName('topic')
                .setDescription('set the game topic')
                .setRequired(true))
            .addStringOption(option => option
                .setName('hint')
                .setDescription('hint to your topic topic')
                .setRequired(true)))
        .addSubcommand(command => command
            .setName('stop')
            .setDescription('stop an ongoing game')
            .addIntegerOption(option => option
                .setName('id')
                .setDescription('id of game to stop')
                .setRequired(true)))
        .addSubcommand(command => command
            .setName('ask')
            .setDescription('ask a question')
            .addStringOption(option => option
                .setName('question')
                .setDescription('whats your question')
                .setRequired(true)))
        .addSubcommand(command => command
            .setName('guess-topic')
            .setDescription('guess the topic')
            .addStringOption(option => option
                .setName('topic')
                .setDescription('enter guess here')
                .setRequired(true)))
        .addSubcommand(command => command
            .setName('leave')
            .setDescription('Leaves the current game')),

    async execute(interaction, client) {
        const guild = await client.guilds.cache.get(interaction.guild.id)
        const member = await guild.members.cache.get(interaction.user.id)
        const { options } = interaction;
        const sub = options.getSubcommand();
        const profile = await gameProfiles.findOne({
            Guild: interaction.guild.id,
            User: interaction.user.id
        })

        switch (sub) {
            case 'setup':
                const maxGames = options.getInteger('max_games')
                const channel = options.getChannel('channel')
                const category = options.getChannel('category')
                const setupembed = new EmbedBuilder()
                    .setColor('#68FC4D')
                    .setAuthor({ name: '❓ 20 Questions' })
                    .setFooter({ text: 'Bot by NitTwit' })
                    .setTimestamp()
                    .setTitle(`Set the max number of games allowed to ${maxGames} and game invites will be sent to ${channel}`)

                await qSetup.deleteMany({ Guild: interaction.guild.id })
                await qSetup.create({
                    Guild: interaction.guild.id,
                    Max: maxGames,
                    Category: category.id,
                    Channel: channel.id
                })

                await interaction.reply({ embeds: [setupembed], ephemeral: true })
                break;
            case 'start':
                const topic = options.getString('topic')
                const hint = options.getString('hint')
                const sData = await qSetup.findOne({
                    Guild: interaction.guild.id,
                })
                if (!sData) {
                    const startembed = new EmbedBuilder()
                        .setColor('#FC4D4D')
                        .setAuthor({ name: '❓ 20 Questions' })
                        .setFooter({ text: 'Bot by NitTwit' })
                        .setTimestamp()
                        .setTitle(`Unable to create new game: Have the server owner run /20-questions setup`)
                    await interaction.reply({ embeds: [startembed], ephemeral: true })
                }
                if (sData) {
                    const topic = options.getString('topic')
                    const guild = await client.guilds.cache.get(interaction.guild.id)
                    const member = await guild.members.cache.get(interaction.user.id)
                    let game_id = generateId();
                    const chnl = client.channels.cache.get(sData.Channel);
                    const startembed = new EmbedBuilder()
                        .setColor('#68FC4D')
                        .setAuthor({ name: '❓ 20 Questions' })
                        .setFooter({ text: 'Bot by NitTwit' })
                        .setTimestamp()
                        .setTitle(`Your game has been created! View your invite in <#${sData.Channel}>`)
                        .setDescription(`Game ID: ${game_id}`)

                    const invite = new EmbedBuilder()
                        .setColor('#F59813')
                        .setAuthor({ name: '❓ 20 Questions' })
                        .setFooter({ text: 'Bot by NitTwit' })
                        .setTimestamp()
                        .setTitle(`A new game has started! Click below to join!`)
                        .addFields({ name: 'Joined:', value: '0/5', inline: true })
                        .addFields({ name: 'Created By:', value: `<@${interaction.user.id}>`, inline: true })
                    const btn = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`20-${game_id}`)
                                .setLabel('Join')
                                .setStyle(ButtonStyle.Success)
                        )

                    try {
                        const eyed = `${sData.Category}`
                        const category = guild.channels.cache.get(eyed);
                        const role = await interaction.guild.roles.create({
                            name: `20_Questions-${game_id}`,
                            color: '#F59813',
                            permissions: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel]
                        });

                        const channel = await guild.channels.create({
                            name: `${interaction.user.username}-${game_id}`,
                            type: ChannelType.GuildText,
                            topic: '20 questions game',
                            permissionOverwrites: [
                                {
                                    id: guild.roles.everyone,
                                    deny: [PermissionsBitField.Flags.ViewChannel],
                                },
                                {
                                    id: `${role.id}`,
                                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                                },
                            ],
                            parent: `${category.id}`
                        });


                        await member.roles.add(role)
                        await interaction.reply({ embeds: [startembed], ephemeral: true })

                        const msg = await chnl.send({ embeds: [invite], components: [btn] });
                        msg.createMessageComponentCollector();
                        await twentyQuestions.create({
                            Guild: interaction.guild.id,
                            GameId: `20-${game_id}`,
                            Topic: `${topic}`,
                            Hint: `${hint}`,
                            User: interaction.user.id,
                            RoleId: role.id,
                            Channel: channel.id,
                            Msg: msg.id,
                            Joined: 0,
                            Active: false,
                            QuestionNum: 0,
                            Users: [],
                            ChannelOrigin: `${chnl.id}`
                        })
                    } catch (error) {
                        console.error('Error creating:', error);
                        await interaction.reply('Error creating role and/or channel');
                    }
                }
                break;
            case 'stop':
                const game_Id = options.getInteger('id')

                const data = await twentyQuestions.findOne({
                    GameId: `20-${game_Id}`
                })
                const msg = await interaction.channel.messages.fetch(data.Msg);

                if (!data) {
                    const embed = new EmbedBuilder()
                        .setColor('#FC4D4D')
                        .setAuthor({ name: '❓ 20 Questions' })
                        .setFooter({ text: 'Bot by NitTwit' })
                        .setTimestamp()
                        .setTitle(`Unable to stop game: Is the Game ID correct? Are you sure the game is still running?`)
                    await interaction.reply({ embeds: [embed], ephemeral: true })
                }
                if (data) {
                    const guild = await client.guilds.cache.get(interaction.guild.id)
                    const member = await guild.members.cache.get(interaction.user.id)
                    const roleToDelete = guild.roles.cache.get(data.RoleId);
                    const channelToDelete = guild.channels.cache.get(data.Channel);
                    try {
                        await roleToDelete.delete();
                        await channelToDelete.delete()
                        await msg.delete()

                        for (j = 0; j < data.Users.length; j++) {
                            var profiles = await gameProfiles.findOne({
                                Guild: interaction.guild.id,
                                User: data.Users[j]
                            })
                            profiles.Playing = false;
                            if (j = data.Users.length) {
                                profiles.save()
                            }
                        }
                    } catch (error) {
                        if (data.Users === null) {
                            console.log('oops')
                            return;
                        }
                    }

                    await twentyQuestions.deleteMany({
                        GameId: `20-${game_Id}`
                    })

                    const embed = new EmbedBuilder()
                        .setColor('#68FC4D')
                        .setAuthor({ name: '❓ 20 Questions' })
                        .setFooter({ text: 'Bot by NitTwit' })
                        .setTimestamp()
                        .setTitle(`Successfully stopped Game - ${game_Id}`)

                    await interaction.reply({ embeds: [embed], ephemeral: true })
                }
                break;
            case 'leave':
                if (!profile) {
                    const embed = new EmbedBuilder()
                        .setColor(Error)
                        .setAuthor({ name: '❓ 20 Questions' })
                        .setFooter({ text: 'Bot by NitTwit' })
                        .setTimestamp()
                        .setTitle(`You don't have a profile setup`)

                    await interaction.reply({ embeds: [embed], ephemeral: true })
                }
                if (profile) {
                    if (profile.Playing == true) {
                        const guild = await client.guilds.cache.get(interaction.guild.id)
                        const member = await guild.members.cache.get(interaction.user.id)
                        const channels = await guild.channels.cache.get(interaction.channel.id)
                        const cName = channels.name
                        const endsWithFiveDigitNumber = /\d{5}$/.test(cName);
                        if (endsWithFiveDigitNumber) {
                            profile.Playing = false;
                            profile.save();
                            const lastFiveChars = cName.slice(-5);
                            const sData = await qSetup.findOne({
                                Guild: interaction.guild.id,
                            })
                            const data = await twentyQuestions.findOne({
                                Guild: interaction.guild.id,
                                GameId: `20-${lastFiveChars}`
                            })
                            const embeds = new EmbedBuilder()
                                .setColor(Error)
                                .setAuthor({ name: '❓ 20 Questions' })
                                .setFooter({ text: 'Bot by NitTwit' })
                                .setTimestamp()
                                .setTitle(`${interaction.user.tag} Has left the game`)

                            await interaction.reply({ embeds: [embeds] })
                            await member.roles.remove(data.RoleId)
                            const ch = await client.channels.fetch(sData.Channel);

                            data.Joined -= 1;
                            data.save()
                            data.Users.pull(interaction.user.id)
                            data.save()


                            const msg = await ch.messages.fetch(data.Msg);
                            const newembed = EmbedBuilder.from(msg.embeds[0]).setFields({ name: "Joined:", value: `${data.Joined}/5`, inline: true }, { name: "Created By", value: `<@${data.User}>`, inline: true })

                            await msg.edit({ embeds: [newembed] })
                        } else {
                            const embed = new EmbedBuilder()
                                .setColor(Error)
                                .setAuthor({ name: '❓ 20 Questions' })
                                .setFooter({ text: 'Bot by NitTwit' })
                                .setTimestamp()
                                .setTitle(`This command must be executed in the game channel!`)

                            await interaction.reply({ embeds: [embed], ephemeral: true })
                        }
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor(Error)
                            .setAuthor({ name: '❓ 20 Questions' })
                            .setFooter({ text: 'Bot by NitTwit' })
                            .setTimestamp()
                            .setTitle(`You aren't playing a game right now!`)

                        await interaction.reply({ embeds: [embed], ephemeral: true })
                    }
                }
                break;
            case 'ask':
                if (profile.Playing) {
                    const question = options.getString('question')
                    const guild = await client.guilds.cache.get(interaction.guild.id)
                    const member = await guild.members.cache.get(interaction.user.id)
                    const channels = await guild.channels.cache.get(interaction.channel.id)
                    const cName = channels.name
                    const endsWithFiveDigitNumber = /\d{5}$/.test(cName);
                    if (endsWithFiveDigitNumber) {
                        const lastFiveChars = cName.slice(-5);
                        const data = await twentyQuestions.findOne({
                            Guild: interaction.guild.id,
                            GameId: `20-${lastFiveChars}`
                        })
                        if (data.Active) {
                            if (data.QuestionNum === 20) {
                                const embed = new EmbedBuilder()
                                    .setColor(Error)
                                    .setAuthor({ name: '❓ 20 Questions' })
                                    .setFooter({ text: 'Bot by NitTwit' })
                                    .setTimestamp()
                                    .setTitle(`You cannot ask anymore questions!`)
                                await interaction.reply({ embeds: [embed], ephemeral: true })
                            } else if (data.QuestionNum < 20) {
                                if (interaction.user.id != data.User) {
                                    data.QuestionNum += 1;
                                    data.save();
                                    const embed = new EmbedBuilder()
                                        .setColor(Orange)
                                        .setAuthor({ name: '❓ 20 Questions' })
                                        .setFooter({ text: 'Bot by NitTwit' })
                                        .setTimestamp()
                                        .setTitle(`Question ${data.QuestionNum}:`)
                                        .setDescription(`${member} Asked: **${question}**`)
                                    const btns = new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                                .setCustomId('twy')
                                                .setLabel('Yes')
                                                .setStyle(ButtonStyle.Success),
                                            new ButtonBuilder()
                                                .setCustomId('twn')
                                                .setLabel('No')
                                                .setStyle(ButtonStyle.Danger)
                                        )
                                    data.QuestionNum += 1

                                    const msg = await interaction.reply({ embeds: [embed], components: [btns] })
                                    msg.createMessageComponentCollector();
                                } else {
                                    const embed = new EmbedBuilder()
                                        .setColor(Error)
                                        .setAuthor({ name: '❓ 20 Questions' })
                                        .setFooter({ text: 'Bot by NitTwit' })
                                        .setTimestamp()
                                        .setTitle(`You cannot ask a question if you know the topic!`)
                                    await interaction.reply({ embeds: [embed], ephemeral: true })
                                }
                            }
                        } else {
                            const embed = new EmbedBuilder()
                                .setColor(Error)
                                .setAuthor({ name: '❓ 20 Questions' })
                                .setFooter({ text: 'Bot by NitTwit' })
                                .setTimestamp()
                                .setTitle(`Please wait for the game to start`)
                            await interaction.reply({ embeds: [embed], ephemeral: true })
                        }
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor(Error)
                            .setAuthor({ name: '❓ 20 Questions' })
                            .setFooter({ text: 'Bot by NitTwit' })
                            .setTimestamp()
                            .setTitle(`This command must be executed in a game channel!`)
                        await interaction.reply({ embeds: [embed], ephemeral: true })
                    }
                } else {

                }
                break;
            case 'guess-topic':
                const guild = await client.guilds.cache.get(interaction.guild.id)
                const channels = await guild.channels.cache.get(interaction.channel.id)
                const cName = channels.name
                const endsWithFiveDigitNumber = /\d{5}$/.test(cName);
                if (endsWithFiveDigitNumber) {
                    const guild = await client.guilds.cache.get(interaction.guild.id)
                    const member = await guild.members.cache.get(interaction.user.id)
                    const lastFiveChars = cName.slice(-5);
                    const data = await twentyQuestions.findOne({
                        Guild: interaction.guild.id,
                        GameId: `20-${lastFiveChars}`
                    })
                    if (data.Active) {
                        const topic = options.getString('topic')
                        const lowercaseString = data.Topic.toLowerCase();
                        const lowercaseCharacters = topic.toLowerCase();
                        if (lowercaseString.includes(lowercaseCharacters)) {
                            const chnl = await client.channels.cache.get(data.ChannelOrigin)
                            const msg = await chnl.messages.fetch(data.Msg);
                            const embed = new EmbedBuilder()
                                .setColor(Success)
                                .setAuthor({ name: '❓ 20 Questions' })
                                .setFooter({ text: 'Bot by NitTwit' })
                                .setTimestamp()
                                .setTitle(`${interaction.user.tag} Guessed the topic!`)
                                .setDescription(`The topic was: **${data.Topic}**`)
                            await channels.send({ embeds: [embed] })
                            await interaction.reply('Game will stop after 5 seconds!')

                            setTimeout(async () => {
                                const roleToDelete = guild.roles.cache.get(data.RoleId);
                                const channelToDelete = guild.channels.cache.get(data.Channel);
                                try {
                                    await roleToDelete.delete();
                                    await channelToDelete.delete()
                                    await msg.delete()

                                    for (j = 0; j < data.Users.length; j++) {
                                        const profiles = await gameProfiles.findOne({
                                            Guild: interaction.guild.id,
                                            User: data.Users[j]
                                        })
                                        profiles.Playing = false;
                                        if (j = data.Users.length) {
                                            profiles.save()
                                        }
                                    }
                                } catch (error) {
                                    console.log(error);
                                }

                                await twentyQuestions.deleteMany({
                                    GameId: `20-${lastFiveChars}`
                                })
                            }, 5000)
                        } else {
                            const embed = new EmbedBuilder()
                                .setColor(Success)
                                .setAuthor({ name: '❓ 20 Questions' })
                                .setFooter({ text: 'Bot by NitTwit' })
                                .setTimestamp()
                                .setTitle(`${interaction.user.tag} Guessed the topic incorrectly!`)
                                .setDescription(`They guessed: **${topic}**`)
                            await channels.send({ embeds: [embed] })
                            await interaction.reply({ content: 'Incorrect!', ephemeral: true })
                        }
                    } else if (!data.Active) {
                        const embed = new EmbedBuilder()
                            .setColor(Error)
                            .setAuthor({ name: '❓ 20 Questions' })
                            .setFooter({ text: 'Bot by NitTwit' })
                            .setTimestamp()
                            .setTitle(`Please wait for the game to start`)
                        await interaction.reply({ embeds: [embed], ephemeral: true })
                    }
                } else {
                    const embed = new EmbedBuilder()
                        .setColor(Error)
                        .setAuthor({ name: '❓ 20 Questions' })
                        .setFooter({ text: 'Bot by NitTwit' })
                        .setTimestamp()
                        .setTitle(`This command must be executed in a game channel!`)
                    await channels({ embeds: [embed], ephemeral: true })

                }
                break;
        }
    }
}