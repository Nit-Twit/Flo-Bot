const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} = require("discord.js");

const { Font } = require("canvacord");
const { GreetingsCard } = require("../../lib/genCard");

Font.fromFileSync("src/lib/comfortaa.ttf");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("General stats and info about the bot"),
  async execute(interaction, client) {
    const name = "Flo";
    const icon = `${client.user.displayAvatarURL()}`;
    let servercount = await client.guilds.cache.reduce(
      (a, b) => a + b.memberCount,
      0
    );

    let ping = `${Date.now() - interaction.createdTimestamp}ms`;

    const card = new GreetingsCard()
      .serverCount(client.guilds.cache.size)
      .totalMembers(servercount)
      .latency(ping)

    const image = await card.build({ format: "png" });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Support Server')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/kEaC88janB'),

            new ButtonBuilder()
                .setLabel('Invite Bot')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.com/api/oauth2/authorize?client_id=1124437696224428163&permissions=8&scope=bot%20applications.commands')
        )

    // const embed = new EmbedBuilder()
    //     .setColor('#75C7D9')
    //     .setAuthor({ name: name, iconURL: icon })
    //     .setThumbnail(`${icon}`)
    //     .setFooter({ text: 'Made with ♥ by nittwit' })
    //     .setTimestamp()
    //     .addFields({ name: 'Server Count:', value: `${client.guilds.cache.size}`, inline: true })
    //     .addFields({ name: 'Server Members:', value: `${servercount}`, inline: true })
    //     .addFields({ name: 'Latency:', value: `${ping}`, inline: true })

    const attachment = new AttachmentBuilder(image, "stats.png")

    await interaction.reply({files: [attachment], components: [row]});
  },
};
