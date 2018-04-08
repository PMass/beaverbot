const Config = require('./config.json');
const Auth = require('./auth.json');
const Bot = require('./bot.js');

const config = { Config: Config, Auth: Auth };

bot = new Bot(config);

bot.client.on("ready", () => {
  bot.init();
  bot.respond();
});

bot.client.on("message", (message) => {
  if (bot.verify(message)) {
    bot.respond(message);
  }
});

bot.client.login(bot.token);