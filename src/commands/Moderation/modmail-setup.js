const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js')
const mmSetup = require('../../Schemas.js/modmailSetup')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modmail')
        .setDescription('Enables modmail on your server')
        .addChannelOption(option => option
            .setName('category')
            .setDescription('category to send modmail to')
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)),
    async execute(interaction) {
        const { options } = interaction;
        const cat = options.getChannel('category')
        await interaction.reply('<a:load_:1124452445788065905> Loading...')
        mmSetup.findOne({
            Guild: interaction.guild.id,
            Category: cat,
            Enabled: true
        }, async (err, data) => {
            if (err) throw err;

            if (!data) {
                setTimeout(async ()=>{
                    mmSetup.create({
                        Guild: interaction.guild.id,
                        Category: cat,
                        Enabled: true
                    })
                    await interaction.editReply(`✅ Success! modmail has been enabled and messages will be sent to ${cat}`)
                }, 2000)
            } else {
                await interaction.editReply({ content: 'You already have modmail setup on this server!' })
            }
        })
    }
}