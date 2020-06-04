const Config = require('./config.json');
const Auth = require('./auth.json');
const Bot = require('./bot.js');

const config = { Config: Config, Auth: Auth };

bot = new Bot(config);

bot.client.on("ready", () => {
  bot.init();
  bot.respond();
});

bot.client.on("presenceUpdate", (oldMember, newMember) => {
  if (!bot.verify(newMember)) {
    return;
  }
  
  if (!bot.channel) {
    console.log("Target channel not found, taking no action.");
    return;
  }

  if (bot.getStreamingStatus(oldMember, newMember)) {
    bot.respond();
  }
});

bot.client.login(bot.token);