const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { SkyBlue, Success, Error } = require('embedstyles')
const gameProfile = require('../../Schemas.js/gameProfiles')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View, create, or delete your profile')
        .addSubcommand(command => command
            .setName('create')
            .setDescription('Create your game profile'))
        .addSubcommand(command => command
            .setName('delete')
            .setDescription('Delete a game profile')
            .addUserOption(option => option
                .setName('user')
                .setDescription('User profile to delete')))
        .addSubcommand(command => command
            .setName('view')
            .setDescription('Create a game profile')
            .addUserOption(option => option
                .setName('user')
                .setDescription('User profile to view'))),
    async execute(interaction, client) {
        const { options } = interaction;
        const sub = options.getSubcommand();
        const guild = await client.guilds.cache.get(interaction.guild.id)
        const member = await guild.members.cache.get(interaction.user.id)
        const user = options.getUser('user')

        switch (sub) {
            case 'create':
                const profile = await gameProfile.findOne({
                    Guild: guild.id,
                    User: member.id
                })
                if (profile) {
                    const embed = new EmbedBuilder()
                        .setColor(Error)
                        .setAuthor({ name: '👤 Profiles' })
                        .setFooter({ text: 'Bot by NitTwit' })
                        .setTimestamp()
                        .setTitle(`You already have a profile!`)
                    await interaction.reply({ embeds: [embed], ephemeral: true })
                }
                if (!profile) {
                    const icon = `${interaction.user.displayAvatarURL()}`
                    await interaction.reply({ content: `<a:load_:1124452445788065905> Please Wait...`, ephemeral: true });
                    setTimeout(async () => {
                        await gameProfile.create({
                            Guild: guild.id,
                            Playing: false,
                            User: member.id,
                            AvatarUrl: icon
                        })
                        const embed = new EmbedBuilder()
                            .setColor(SkyBlue)
                            .setAuthor({ name: '👤 Profiles', iconURL: icon })
                            .setFooter({ text: 'Bot by NitTwit' })
                            .setTimestamp()
                            .setTitle('Successfully created profile!')
                        await interaction.editReply({ content: '', embeds: [embed], ephemeral: true })
                    }, 1500)

                }
                break
            case 'delete':
                if (user) {
                    const profile = await gameProfile.findOne({
                        Guild: guild.id,
                        User: member.id
                    })
                    if (profile) {
                        const icon = `${user.displayAvatarURL()}`
                        await gameProfile.deleteMany({
                            Guild: interaction.guild.id,
                            User: user.id
                        })
                        const embed = new EmbedBuilder()
                            .setColor(Success)
                            .setAuthor({ name: '👤 Profiles', iconURL: icon })
                            .setFooter({ text: 'Bot by NitTwit' })
                            .setTimestamp()
                            .setDescription(`Successfully deleted ${user}'s profile`)
                        await interaction.reply({ content: '', embeds: [embed], ephemeral: true })

                    } else {
                        const icon = `${user.displayAvatarURL()}`
                        const embed = new EmbedBuilder()
                            .setColor(Error)
                            .setAuthor({ name: '👤 Profiles', iconURL: icon })
                            .setFooter({ text: 'Bot by NitTwit' })
                            .setTimestamp()
                            .setDescription(`${user} does not have a profile`)
                        await interaction.reply({ content: '', embeds: [embed], ephemeral: true })
                    }
                } else {
                    const icon = `${interaction.user.displayAvatarURL()}`
                    const profile = await gameProfile.findOne({
                        Guild: guild.id,
                        User: member.id
                    })
                    if (profile) {
                        await gameProfile.deleteMany({
                            Guild: interaction.guild.id,
                            User: interaction.user.id
                        })
                        const embed = new EmbedBuilder()
                            .setColor(Success)
                            .setAuthor({ name: '👤 Profiles', iconURL: icon })
                            .setFooter({ text: 'Bot by NitTwit' })
                            .setTimestamp()
                            .setDescription(`Successfully deleted your profile`)
                        await interaction.reply({ content: '', embeds: [embed], ephemeral: true })

                    } else {
                        const embed = new EmbedBuilder()
                            .setColor(Error)
                            .setAuthor({ name: '👤 Profiles', iconURL: icon })
                            .setFooter({ text: 'Bot by NitTwit' })
                            .setTimestamp()
                            .setDescription(`You do not have a profile`)
                        await interaction.reply({ content: '', embeds: [embed], ephemeral: true })
                    }
                }
                break
            case 'view':
                break
        }
    }
}