const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, PermissionsBitField, Permissions, MessageManager, Embed, ChannelType, Collection, Partials, RequestManager } = require(`discord.js`);
const fs = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageTyping], partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.Reaction] });
const { Events } = require("discord.js")
const { Orange, Error, SkyBlue, Success } = require('embedstyles')

client.commands = new Collection();

new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
});

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token)
})();

//auto reactions
const reactor = require('./Schemas.js/rr')
client.on(Events.MessageCreate, async message => {
    if (message.channel.type == ChannelType.GuildText) {
        const data = await reactor.findOne({ Guild: message.guild.id, Channel: message.channel.id })
        if (!data) return
        else {
            if (message.author.bot) return
            message.react(data.Emoji).catch(async err => {
                const owner = message.guild.members.cache.get(message.guild.ownerId);
                await owner.send(`Error With Auto Reactions - \`${err}\``)
            })
        }
    }
})


//Poll Logic
const pollSchema = require('./Schemas.js/vote');
client.on(Events.InteractionCreate, async i => {
    if (!i.guild) return;
    if (!i.message) return;
    if (!i.isButton) return;


    const data = await pollSchema.findOne({ Guild: i.guild.id, Msg: i.message.id })

    if (!data) return;
    const msg = await i.channel.messages.fetch(data.Msg);
    //await i.channel.send(i.channel.messages.fetch(data.Msg))

    if (i.customId === 'up') {
        if (data.UpMembers.includes(i.user.id)) return await i.reply({ content: 'You cannot upvote more than once!', ephemeral: true });
        let downvotes = data.Downvote
        if (data.DownMembers.includes(i.user.id)) {
            downvotes = downvotes - 1;
        }

        const newembed = EmbedBuilder.from(msg.embeds[0]).setFields({ name: "Upvotes:", value: ` **${data.Upvote + 1}** Upvotes`, inline: true }, { name: "Downvotes:", value: ` **${downvotes}** Downvotes`, inline: true }, { name: "Posted By", value: `<@${data.Owner}>`, inline: true })
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`up`)
                    .setLabel(`✅`)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId(`down`)
                    .setLabel(`❌`)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId(`votes`)
                    .setLabel(`Votes:`)
                    .setStyle(ButtonStyle.Secondary)
            )

        await i.update({ embeds: [newembed], components: [buttons] })

        data.Upvote++;

        if (data.DownMembers.includes(i.user.id)) {
            data.Downvote = data.Downvote - 1;
        }

        data.UpMembers.push(i.user.id);
        data.DownMembers.pull(i.user.id);
        data.save();
    }

    if (i.customId === 'down') {
        if (data.DownMembers.includes(i.user.id)) return await i.reply({ content: 'You cannot downvote more than once!', ephemeral: true });
        let upvotes = data.Upvote
        if (data.UpMembers.includes(i.user.id)) {
            upvotes = upvotes - 1;
        }

        const newembed = EmbedBuilder.from(msg.embeds[0]).setFields({ name: "Upvotes:", value: ` **${upvotes}** Upvotes`, inline: true }, { name: "Downvotes:", value: ` **${data.Downvote + 1}** Downvotes`, inline: true }, { name: "Posted By", value: `<@${data.Owner}>`, inline: true })
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`up`)
                    .setLabel(`✅`)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId(`down`)
                    .setLabel(`❌`)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId(`votes`)
                    .setLabel(`Votes`)
                    .setStyle(ButtonStyle.Secondary)
            )

        await i.update({ embeds: [newembed], components: [buttons] })

        data.Downvote++;

        if (data.UpMembers.includes(i.user.id)) {
            data.Upvote = data.Upvote - 1;
        }

        data.DownMembers.push(i.user.id);
        data.UpMembers.pull(i.user.id);
        data.save();
    }

    if (i.customId === 'votes') {
        let upvoters = [];
        data.UpMembers.forEach(async (member) => {
            upvoters.push(`<@${member}>`);
        })

        let downvoters = [];
        data.DownMembers.forEach(async (member) => {
            downvoters.push(`<@${member}>`);
        })

        const embed = new EmbedBuilder()
            .setColor('#75C7D9')
            .setAuthor({ name: '🤚 Poll System' })
            .setFooter({ text: 'Bot by NitTwit' })
            .setTimestamp()
            .setTitle('Poll Votes')
            .addFields({ name: `Upvoters: ${upvoters.length}`, value: `> ${upvoters.join(', ').slice(0, 1020) || `No Upvoters`}`, inline: true })
            .addFields({ name: `Downvoters: ${downvoters.length}`, value: `> ${downvoters.join(', ').slice(0, 1020) || `No Downvoters`}`, inline: true })

        await i.reply({ embeds: [embed], ephemeral: true })
    }
})

//Reaction Roles

const rolesSchema = require('./Schemas.js/reactionrs')

client.on(Events.MessageReactionAdd, async (reaction, user) => {

    if (!reaction.message.guild) return;
    if (user.bot) return;

    let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
    if (!reaction.emoji.id) cID = reaction.emoji.name;

    const data = await rolesSchema.findOne({
        Guild: reaction.message.guildId,
        Message: reaction.message.id,
        Emoji: cID
    })

    if (!data) return

    const guild = await client.guilds.cache.get(reaction.message.guildId)
    const member = await guild.members.cache.get(user.id)

    try {
        await member.roles.add(data.Role)
    } catch (e) {
        console.log(e);
    }

})

client.on(Events.MessageReactionRemove, async (reaction, user) => {

    if (!reaction.message.guild) return;
    if (user.bot) return;

    let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
    if (!reaction.emoji.id) cID = reaction.emoji.name;

    const data = await rolesSchema.findOne({
        Guild: reaction.message.guildId,
        Message: reaction.message.id,
        Emoji: cID
    })

    if (!data) return

    const guild = await client.guilds.cache.get(reaction.message.guildId)
    const member = await guild.members.cache.get(user.id)

    try {
        await member.roles.remove(data.Role)
    } catch (e) {
        console.log(e);
    }

})

// 20 Questions
const twentyQuestions = require('./Schemas.js/game-20')
const gameProfiles = require('./Schemas.js/gameProfiles');

client.on(Events.InteractionCreate, async (i, user) => {
    if (!i.guild) return;
    if (!i.message) return;
    if (!i.isButton) return;
    if (i.customId.startsWith("20-")) {
        const gId = i.customId;
        const data = await twentyQuestions.findOne({
            Guild: i.guild.id,
            GameId: gId
        })
        let users;
        if (!data) {
            const embed = new EmbedBuilder()
                .setColor(Error)
                .setAuthor({ name: '❓ 20 Questions' })
                .setFooter({ text: 'Bot by NitTwit' })
                .setTimestamp()
                .setTitle(`The game is over!`)
            await i.reply({ embeds: [embed], ephemeral: true })
            return;
        }
        users = (data.Users)

        const profile = await gameProfiles.findOne({
            Guild: i.guild.id,
            User: i.user.id
        })
        if (!data) return await i.reply({ content: `This game doesn't exist anymore!`, ephemeral: true })
        if (data) {
            if (!profile) {
                const embed = new EmbedBuilder()
                    .setColor(Error)
                    .setAuthor({ name: '❓ 20 Questions' })
                    .setFooter({ text: 'Bot by NitTwit' })
                    .setTimestamp()
                    .setTitle('You dont have a profile!\nShould I make one for you?')
                const btns = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('y')
                            .setLabel('Yes')
                            .setStyle(ButtonStyle.Success),

                        new ButtonBuilder()
                            .setCustomId('n')
                            .setLabel('No')
                            .setStyle(ButtonStyle.Danger)

                    )
                await i.reply({ embeds: [embed], components: [btns], ephemeral: true })
            }
            if (profile) {
                if (i.user.id === data.User) {
                    const embed = new EmbedBuilder()
                        .setColor(Error)
                        .setAuthor({ name: '❓ 20 Questions' })
                        .setFooter({ text: 'Bot by NitTwit' })
                        .setTimestamp()
                        .setTitle(`You cant join your own game!`)
                    await i.reply({ embeds: [embed], ephemeral: true })
                } else {
                    if (profile.Playing != true) {
                        if (data.Active != true) {
                            if (data.Joined < 5) {
                                profile.Playing = true;
                                profile.save();
                                data.Joined += 1;
                                data.save();
                                const msg = await i.channel.messages.fetch(data.Msg);
                                const newembed = EmbedBuilder.from(msg.embeds[0]).setFields({ name: "Joined:", value: `${data.Joined}/5`, inline: true }, { name: "Created By", value: `<@${data.User}>`, inline: true })
                                await msg.edit({ embeds: [newembed] });
                                await i.reply({ content: 'Successfully joined!', ephemeral: true })
                                const guild = await client.guilds.cache.get(i.guild.id)
                                const member = await guild.members.cache.get(i.user.id)
                                const channel = await guild.channels.cache.get(data.Channel)
                                try {
                                    await member.roles.add(data.RoleId)
                                    const embed = new EmbedBuilder()
                                        .setColor(Orange)
                                        .setAuthor({ name: '❓ 20 Questions', iconURL: profile.AvatarUrl })
                                        .setFooter({ text: 'Bot by NitTwit' })
                                        .setTimestamp()
                                        .setTitle(`${i.user.tag} Has joined the game`)
                                    await channel.send({ embeds: [embed] });
                                    data.Users.push(i.user.id)
                                    console.log(data.Users);
                                } catch (error) {
                                    console.log(error)
                                }
                                if (data.Joined === 5) {
                                    data.Active = true;
                                    //data.save();
                                    const embed = new EmbedBuilder()
                                        .setColor('#F59813')
                                        .setAuthor({ name: '❓ 20 Questions' })
                                        .setFooter({ text: 'Bot by NitTwit' })
                                        .setTimestamp()
                                        .setTitle(`Game Hint:`)
                                        .setDescription(`${data.Hint}`)
                                    await channel.send({ embeds: [embed] })

                                } else {
                                    return;
                                }
                                data.save()
                            } else {
                                const embed = new EmbedBuilder()
                                    .setColor(Error)
                                    .setAuthor({ name: '❓ 20 Questions' })
                                    .setFooter({ text: 'Bot by NitTwit' })
                                    .setTimestamp()
                                    .setTitle(`This game is full!`)
                                await i.reply({ embeds: [embed], ephemeral: true })

                            }
                        } else {
                            const embed = new EmbedBuilder()
                                .setColor(Error)
                                .setAuthor({ name: '❓ 20 Questions' })
                                .setFooter({ text: 'Bot by NitTwit' })
                                .setTimestamp()
                                .setTitle(`This game has already started!`)
                            await i.reply({ embeds: [embed], ephemeral: true })
                        }
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor(Error)
                            .setAuthor({ name: '❓ 20 Questions' })
                            .setFooter({ text: 'Bot by NitTwit' })
                            .setTimestamp()
                            .setTitle(`You cant join more than one game game!`)
                        await i.reply({ embeds: [embed], ephemeral: true })
                    }
                }
            }
        }
    }
})


client.on(Events.InteractionCreate, async i => {
    if (!i.guild) return;
    if (!i.message) return;
    if (!i.isButton) return;
    if (i.customId === 'n') {
        const embed = new EmbedBuilder()
            .setColor(SkyBlue)
            .setAuthor({ name: '❓ 20 Questions' })
            .setFooter({ text: 'Bot by NitTwit' })
            .setTimestamp()
            .setTitle(`You can create a profile at any time with\n/profile create`)
        await i.reply({ embeds: [embed], ephemeral: true })
    }
    if (i.customId === 'y') {
        const icon = `${i.user.displayAvatarURL()}`
        await i.reply({ content: `<a:load_:1124452445788065905> Please Wait...`, ephemeral: true });
        setTimeout(async () => {
            await gameProfiles.create({
                Guild: i.guild.id,
                Playing: false,
                User: i.user.id,
                AvatarUrl: icon
            })
            const embed = new EmbedBuilder()
                .setColor(SkyBlue)
                .setAuthor({ name: '❓ 20 Questions', iconURL: icon })
                .setFooter({ text: 'Bot by NitTwit' })
                .setTimestamp()
                .setTitle('Successfully created profile!')
            await i.editReply({ content: '', embeds: [embed], ephemeral: true })
        }, 1500)
    }
})

client.on(Events.InteractionCreate, async i => {
    if (!i.guild) return;
    if (!i.message) return;
    if (!i.isButton) return;
    if (i.customId === 'twn') {
        const data = await twentyQuestions.findOne({
            Guild: i.guild.id,
            User: i.user.id
        })
        if (!data) {
            const embed = new EmbedBuilder()
                .setColor(Error)
                .setAuthor({ name: '❓ 20 Questions' })
                .setFooter({ text: 'Bot by NitTwit' })
                .setTimestamp()
                .setTitle(`Only the game host can use these buttons`)
            await i.reply({ embeds: [embed] })
        } else {
            const embed = new EmbedBuilder()
                .setColor(Orange)
                .setAuthor({ name: '❓ 20 Questions' })
                .setFooter({ text: 'Bot by NitTwit' })
                .setTimestamp()
                .setTitle(`That was incorrect`)
            await i.reply({ embeds: [embed] })
        }
    }
    if (i.customId === 'twy') {
        const data = await twentyQuestions.findOne({
            Guild: i.guild.id,
            User: i.user.id
        })
        if (!data) {
            const embed = new EmbedBuilder()
                .setColor(Error)
                .setAuthor({ name: '❓ 20 Questions' })
                .setFooter({ text: 'Bot by NitTwit' })
                .setTimestamp()
                .setTitle(`Only the game host can use these buttons`)
            await i.reply({ embeds: [embed] })
        } else {
            const embed = new EmbedBuilder()
                .setColor(Orange)
                .setAuthor({ name: '❓ 20 Questions' })
                .setFooter({ text: 'Bot by NitTwit' })
                .setTimestamp()
                .setTitle(`That was correct!`)
            await i.reply({ embeds: [embed] })
        }
    }
})

client.on('messageCreate', async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (message.isCommand) return;

    const guild = client.guilds.cache.get(message.guild.id);
    const channel = guild.channels.cache.get(message.channelId);
    const cName = channel.name;
    const endsWithFiveDigitNumber = /\d{5}$/.test(cName);

    if (endsWithFiveDigitNumber) {
        const lastFiveChars = cName.slice(-5);
        const data = await twentyQuestions.findOne({
            Guild: message.guild.id,
            GameId: `20-${lastFiveChars}`
        });

        if (message.channelId === data.Channel) {
            const rep = await message.reply({ content: 'This is a command-only channel.', ephemeral: true });
            await message.delete();
            setTimeout(async () => {
                await rep.delete();
            }, 1000)
        }
    } else {
        return;
    }
});