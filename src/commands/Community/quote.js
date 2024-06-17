const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

var c = [
  "amazing",
  "art",
  "best",
  "business",
  "courage",
  "death",
  "dreams",
  "equality",
  "experience",
  "faith",
  "family",
  "famous",
  "friendship",
  "funny",
  "happiness",
  "health",
  "history",
  "inspirational",
  "intelligence",
  "knowledge",
  "leadership",
  "life",
  "money",
  "movies",
];

const choices = c.map((choice) => ({ name: choice, value: choice }));

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function get(category) {
    console.log(category)
  const res = await fetch(
    `https://api.api-ninjas.com/v1/quotes?category=${category}`,
    {
      headers: { "X-Api-Key": "qKZDql0VPPQTYNZdWepcAg==AcdYqEg8YhUA4w1A" },
    }
  );

  const [result] = await res.json();
  console.log(result);
  const quote = `" ${result.quote} "`;
  const author = result.author;

  return {
    quote: quote,
    author: author,
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Gives you a random quote")
    .addStringOption((o) =>
      o
        .setName("category")
        .setDescription("category to pick")
        .addChoices(...choices)
        .setRequired(true)
    ),
  async execute(interaction) {
    const { quote, author } = await get(interaction.options.getString("category"))
      const embed = new EmbedBuilder()
        .setColor("#75C7D9")
        .setAuthor({ name: "🖊️ Quotifier for discord" })
        .setFooter({ text: "Bot by NitTwit" })
        .setTimestamp()
        .setDescription(`### ${quote} \n-${author}`);
      await interaction.reply({ embeds: [embed] });
  },
};
