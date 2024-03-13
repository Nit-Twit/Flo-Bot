const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js')
const rolesSchema = require('../../Schemas.js/reactionrs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaction-roles')
        .setDescription('Manage your reaction roles system')
        .addSubcommand(command => command
            .setName('add')
            .setDescription('Add a reaction role to a message')
            .addStringOption(option => option
                .setName('message_id')
                .setDescription('Message to add reaction role to')
                .setRequired(true))
            .addStringOption(option => option
                .setName('emoji')
                .setDescription('Emoji to react with')
                .setRequired(true))
            .addRoleOption(option => option
                .setName('role')
                .setDescription('Role that will be given')
                .setRequired(true)))
        .addSubcommand(command => command
            .setName('remove')
            .setDescription('Removes a reaction role from a message')
            .addStringOption(option => option
                .setName('message_id')
                .setDescription('Message to get role from')
                .setRequired(true))
            .addStringOption(option => option
                .setName('emoji')
                .setDescription('Emoji used to react with')
                .setRequired(true))),

    async execute(interaction, client) {
        const icon = `${client.user.displayAvatarURL()}`
        const { options } = interaction;
        const sub = options.getSubcommand();
        const emoji = options.getString('emoji')

        let e;
        const message = await interaction.channel.messages.fetch(options.getString('message_id')).catch(err => {
            e = err;
        })

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return await interaction.reply({ content: 'You must have `MANAGE ROLES` enabled to use this command. If you think this is an error, contact the server owner', epemeral: true });
        if (e) console.log(e)
        if (e) return await interaction.reply({ content: `Something went wrong - Make sure to get a message from ${interaction.channel}`, ephemeral: true });

        const data = await rolesSchema.findOne({
            Guild: interaction.guild.id,
            Message: message.id,
            Emoji: emoji
        })

        switch (sub) {
            case 'add':
                if (data) {
                    return await interaction.reply({ content: `You already have a reaction role using ${emoji}`, ephemeral: true });
                } else {
                    const role = options.getRole('role');
                    await rolesSchema.create({
                        Guild: interaction.guild.id,
                        Message: message.id,
                        Emoji: emoji,
                        Role: role.id
                    })
                    const embed = new EmbedBuilder()
                        .setColor('#75C7D9')
                        .setAuthor({ name: 'Reaction Roles', iconURL: icon })
                        .setFooter({ text: 'Bot by NitTwit' })
                        .setTimestamp()
                        .setDescription(`✅ Added a reaction role to ${message.url} with ${emoji} and ${role}`)

                    await message.react(emoji).catch(err => { })
                    await interaction.reply({ embeds: [embed] })
                }
                break;
            case 'remove':
                if (!data) return await interaction.reply({ content: `🤔 It doesn't look like you have that reaction role set up.`, ephemeral: true })
                if (data) {
                    await rolesSchema.deleteMany({
                        Guild: interaction.guild.id,
                        Message: message.id,
                        Emoji: emoji,
                    })

                    const embed = new EmbedBuilder()
                        .setColor('#75C7D9')
                        .setAuthor({ name: 'Reaction Roles', iconURL: icon })
                        .setFooter({ text: 'Bot by NitTwit' })
                        .setTimestamp()
                        .setDescription(`✅ Removed a reaction role from ${message.url}`)
                    await interaction.reply({ embeds: [embed], ephemeral: true })

                }
                break;
        }

    }
}