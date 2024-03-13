const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js')
const set = require('../../Schemas.js/setup')

let r = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff-role')
        .setDescription('Setup the staff roles to your server')
        .addSubcommand(command => command
            .setName('add')
            .setDescription('Add a staff role')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('role to add')
                .setRequired(true)))
        .addSubcommand(command => command
            .setName('remove')
            .setDescription('Remove a staff role')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('role to remove')
                .setRequired(true)))
        .addSubcommand(command => command
            .setName('list')
            .setDescription('Remove a staff role')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('role to remove')
                .setRequired(true))),
    async execute(interaction) {
        const userID = interaction.user.id;
        const { options } = interaction;
        const sub = options.getSubcommand();
        const role = options.getRole('role')

        if (interaction.guild.ownerId === userID) {
            const data = await set.findOne({
                Guild: interaction.guild.id,
                Role: role.id
            })

            switch (sub) {
                case 'add':
                    if (!data) {
                        r.push(`${role.id}`)
                        await set.create({
                            Guild: interaction.guild.id,
                            Role: r
                        }).catch(err => {
                            if (err) return
                        })
                        //await interaction.reply({ content: `Successfully added ${role} as a staff role!`, ephemeral: true });
                        let downvoters = [];
                        data.DownMembers.forEach(async () => {
                            downvoters.push(`1`);
                        })
                        await interaction.reply(downvoters)
                    }
                    if (data) return await interaction.reply({ content: `❌ It looks like ${role} is already a staff role`, ephemeral: true });
                    break;
                case 'remove':
                    if (data) {
                        data.Role.pull(role.id)
                        data.save();
                        await set.deleteMany({
                            Guild: interaction.guild.id,
                            Role: role.id
                        }).catch(err => {
                            if (err) return
                        })
                        await interaction.reply({ content: `Successfully removed ${role} as a staff role!`, ephemeral: true });
                    }
                    if (!data) return await interaction.reply({ content: `❌ It looks like ${role} is not a staff role`, ephemeral: true });
            }
        } else {
            await interaction.reply({ content: "You must be the server's owner to execute this command", ephemeral: true });
        }

    }
}