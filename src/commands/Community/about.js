const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Embed } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Tells you why i created the bot.'),

    async execute(interaction, client) {
        const icon = `${client.user.displayAvatarURL()}`
        let servercount = await client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)
        const embed = new EmbedBuilder()
            .setColor('#75C7D9')
            .setAuthor({ name: '📣 About Bot', iconURL: icon })
            .setFooter({ text: 'Bot by NitTwit' })
            .setTimestamp()
            .setTitle('About Flo:')
            .setDescription(`Hello, nittwit here. I created this bot as a way to reduce the number of bots required for a single server. Utilcord is constantly being worked on to become a more neat and organized bot. Utilcord is currently serving **${servercount}** users across **${client.guilds.cache.size}** servers.`)

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/buFCW5QvS4'),

                new ButtonBuilder()
                    .setLabel('Invite Bot')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/api/oauth2/authorize?client_id=1124437696224428163&permissions=8&scope=bot%20applications.commands'),

                new ButtonBuilder()
                    .setLabel('Donate')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.paypal.com/donate/?business=CA3H8C9VNFKGU&no_recurring=0&currency_code=USD')
            )

        await interaction.reply({ embeds: [embed], components: [button] })
    }
}