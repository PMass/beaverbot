const Config = require('./config.json');
const Roles = require('./roles.js');
const Auth = require('./auth.json');
const Bot = require('./bot.js');

const config = { Config: Config, Roles: Roles, Auth: Auth };

bot = new Bot(config);

bot.client.on("ready", () => {
  bot.init();
});

bot.client.on("message", (message) => {
  if (bot.verify(message)) {
    bot.respond(message);
  }
});

bot.client.login(bot.token);