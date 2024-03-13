const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed } = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows the commands available'),

    async execute(interaction, client) {
        const icon = `${client.user.displayAvatarURL()}`

        const embed = new EmbedBuilder()
            .setColor('#75C7D9')
            .setAuthor({ name: '🤖 Bot Help', iconURL: icon })
            .setFooter({ text: 'Bot by NitTwit' })
            .setTimestamp()
            .setTitle('Bot Help')
            .addFields({ name: 'Page 1', value: 'Help & Resources' })
            .addFields({ name: 'Page 2', value: 'Community Commands' })
            .addFields({ name: 'Page 3', value: 'Moderation Commands' })

        const embed2 = new EmbedBuilder()
            .setColor('#75C7D9')
            .setAuthor({ name: '🤖 Bot Help', iconURL: icon })
            .setFooter({ text: 'Bot by NitTwit' })
            .setTimestamp()
            .setTitle('Community Commands')
            .addFields({ name: '/help', value: 'Shows the commands available' })
            .addFields({ name: '/ping', value: 'Replies with pong' })
            .addFields({ name: '/stats', value: 'Shows general info about Flo' })
            .addFields({ name: '/about', value: 'Gives insight as to why the bot was created' })
            .addFields({ name: '/quote', value: 'Generates a random quote' })


        const embed3 = new EmbedBuilder()
            .setColor('#75C7D9')
            .setAuthor({ name: '🤖 Bot Help', iconURL: icon })
            .setFooter({ text: 'Bot by NitTwit' })
            .setTimestamp()
            .setTitle('Monderation Commands')
            .addFields({ name: '/poll **topic**', value: 'Creates a poll for users to interact with' })
            .addFields({ name: '/automod', value: 'Allows the server admins to set automod rules' })
            .addFields({ name: '/ban **user** *reason*', value: 'Bans a user from your server' })
            .addFields({ name: '/unban **user_id**', value: 'Unbans a user from your server' })
            .addFields({ name: '/kick **user** *reason*', value: 'Kicks a user from your server' })
            .addFields({ name: '/reactor setup', value: 'Sets up auto reactions for a specific channel' })
            .addFields({ name: '/reactor disable', value: 'Disables auto reactions for a specific channel' })
            .addFields({ name: '/reactor disable-all', value: 'Turns off auto reactions for your server' })
            .addFields({ name: '/reaction-roles add **Message_id** **Emoji** **Role**', value: 'Create a reaction role' })
            .addFields({ name: '/reaction-roles remove **Message_id** **Emoji**', value: 'Remove a reaction role' })

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('p1')
                    .setLabel('Page 1')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('p2')
                    .setLabel('Page 2')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('p3')
                    .setLabel('Page 3')
                    .setStyle(ButtonStyle.Secondary),
            )
        const message = await interaction.reply({ embeds: [embed], components: [button]})
        const collector = await message.createMessageComponentCollector()

        collector.on('collect', async i => {
            if (i.customId === 'p1'){
                if(i.user.id !== interaction.user.id){
                    return;
                }
                await i.update({embeds: [embed], components: [button]})
            }
            if (i.customId === 'p2'){
                if(i.user.id !== interaction.user.id){
                    return;
                }
                await i.update({embeds: [embed2], components: [button]})
            }
            if (i.customId === 'p3'){
                if(i.user.id !== interaction.user.id){
                    return;
                }
                await i.update({embeds: [embed3], components: [button]})
            }
        })

    }
}