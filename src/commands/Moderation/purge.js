const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js')
const { Success, Error } = require('embedstyles')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Removes a certain amount of messages')
        .addIntegerOption(option => option
            .setName('amount')
            .setDescription('Amount of messages to purge')
            .setMinValue(1)
            .setMaxValue(99)
            .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return await interaction.reply({ content: 'You cannot execute this command!', ephemeral: true })
        const { options } = interaction;
        const amount = options.getInteger('amount')
        try {
            await interaction.channel.bulkDelete(amount + 1);
            const embed = new EmbedBuilder()
                .setColor(Success)
                .setAuthor({ name: '❓ 20 Questions' })
                .setFooter({ text: 'Bot by NitTwit' })
                .setTimestamp()
                .setTitle(`Successfully deleted ${amount + 1} messages!`)
            await interaction.reply({ embeds: [embed] })
            setTimeout(async ()=>{
                await interaction.deleteReply()
            }, 1500)
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor(Error)
                .setAuthor({ name: '❓ 20 Questions' })
                .setFooter({ text: 'Bot by NitTwit' })
                .setTimestamp()
                .setTitle(`Could not purge messages`)
            await interaction.reply({ embeds: [embed] })
            console.log(error)
        }
    }
}