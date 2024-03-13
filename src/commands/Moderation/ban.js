const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user')
        .addUserOption(option => option.setName('user').setDescription('User to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for ban')),

    async execute(interaction) {
        const { options } = interaction;
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply("You don't have permission to use this command.");
        }

        const userToBan = options.getUser('user');

        const banReason = options.getString('reason')

        const memberToBan = interaction.guild.members.cache.get(userToBan.id);

        if (!memberToBan) {
            return interaction.reply("The mentioned user is not a member of this server.");
        }

        if(banReason){
            await userToBan.send(`You have been banned from: **${interaction.guild.name}**\nReason: **${banReason}**`)
            await memberToBan.ban({reason: `${banReason}`});
            await interaction.reply(`${userToBan} has been banned.`);
        }
        if(!banReason){
            await userToBan.send(`You have been banned from: **${interaction.guild.name}**\nReason: No Reason Provided`)
            await memberToBan.ban();
            await interaction.reply(`${userToBan} has been banned.`);
        }
    }
}