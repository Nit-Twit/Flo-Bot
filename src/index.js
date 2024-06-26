const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, PermissionsBitField, Permissions, MessageManager, Embed, ChannelType, Collection, Partials, RequestManager } = require(`discord.js`);
const fs = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageTyping], partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.Reaction] });
const { Events } = require("discord.js")
const { Orange, Error, SkyBlue, Success } = require('embedstyles')
console.log(process.env.TOKEN);

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
    client.login(process.env.TOKEN)
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