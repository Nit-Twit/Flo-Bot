const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user')
        .addUserOption(option => option.setName('user').setDescription('User to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for kick')),

    async execute(interaction) {
        const { options } = interaction;
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply("You don't have permission to use this command.");
        }

        const userTokick = options.getUser('user');

        const kickReason = options.getString('reason')

        const memberTokick = interaction.guild.members.cache.get(userTokick.id);

        if (!memberTokick) {
            return interaction.reply("The mentioned user is not a member of this server.");
        }

        if(kickReason){
            await userTokick.send(`You have been kicked from: **${interaction.guild.name}**\nReason: **${kickReason}**`)
            await memberTokick.kick({reason: `${kickReason}`});
            await interaction.reply(`${userTokick} has been kickned.`);
        }
        if(!kickReason){
            await userTokick.send(`You have been kicked from: **${interaction.guild.name}**\nReason: No Reason Provided`).catch((err)=>{
                return;
            })
            await memberTokick.kick();
            await interaction.reply(`${userTokick} has been kicked.`);
        }
    }
}