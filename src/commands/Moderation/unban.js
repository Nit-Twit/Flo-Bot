const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user')
        .addStringOption(option => option.setName('user_id').setDescription('ID of user to unban').setRequired(true)),

    async execute(interaction) {
        const { options } = interaction;
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply("You don't have permission to use this command.");
        }

        const userToBan = options.getString('user_id');

        //await userToBan.send(`You have been unbanned from **${interaction.guild.name}**`)
        await interaction.guild.members.unban(userToBan);
        await interaction.reply(`<@${userToBan}> has been unbanned.`);
    }
}