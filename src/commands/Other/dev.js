const { SlashCommandBuilder } = require('discord.js')
const set = require('../../Schemas.js/gameProfiles')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription(`deletes the dev's game profile lol`),
    async execute(interaction) {

        const { options } = interaction

        if (interaction.member.id === '989924991535566879') {
            await set.deleteMany({
                Guild: interaction.guild.id,
                User: '989924991535566879'
            })
            await interaction.reply('Done!')
        } else {
            await interaction.reply({ content: `You have to be the bot's developer to execute this command!`, ephemeral: true })
        }
    }
}