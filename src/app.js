const Discord = require("discord.js");
const client = new Discord.Client();

const { speech } = require("./tts");

const { DISCORD_TOKEN } = process.env;

// 読み上げ中の Guild ID と Channel ID の key value dictionary
// TODO: This should be exported to out of memory
const readingChannelDictionary = {};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  // 呼ばれたチャンネルで発言された、自分以外のテキストを読み上げる
  const readingChannelId = readingChannelDictionary[msg.guild.id];
  if (
    readingChannelId !== undefined &&
    readingChannelId === msg.channel.id &&
    msg.author.tag !== client.user.tag
  ) {
    const connection = client.voice.connections.get(msg.guild.id);
    if (connection) {
      const content = await speech(msg.content);
      const dispatcher = connection.play(content, {
        highWaterMark: 6,
        bitrate: "auto",
      });

      dispatcher.on("finish", () => {
        content.destroy();
        dispatcher.destroy();
      });

      dispatcher.on("close", () => {
        content.destroy();
        dispatcher.destroy();
      });

      dispatcher.on("error", () => {
        content.destroy();
        dispatcher.destroy();
      });
    }
  }

  // 呼ばれたらボイスチャンネルに入りに行く
  if (msg.content.startsWith("おいでわんりきー")) {
    const user = msg.member;
    const channel = user.voice.channel;

    if (!channel) {
      msg.channel.send("どこにいけばいいの？");
    } else {
      msg.channel.send("うん！");
      channel.join();

      readingChannelDictionary[msg.guild.id] = msg.channel.id;
    }
  }
});

// ぼっちになったらボイスチャンネルを抜ける
client.on("voiceStateUpdate", (_, state) => {
  const connection = client.voice.connections.get(state.guild.id);
  if (
    connection &&
    connection.channel &&
    connection.channel.members.array().length < 2
  ) {
    connection.disconnect();
    readingChannelDictionary[state.guild.id] = undefined;
  }
});

client.on("error", (error) => {
  console.log("error:", JSON.stringify(error));
  process.exit(1);
});

client.on("disconnect", () => {
  console.log("Client is disconnected!");
  process.exit(1);
});

client.login(DISCORD_TOKEN);
