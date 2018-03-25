const request = require('request');
const Discord = require('discord.js');

function Bot (config) {
  let that = {};
  
  that.Roles = config.Roles;
  that.auth = config.Auth;
  that.config = config.Config;
  
  that.streamName = process.argv.slice(2)[0];
  that.token = that.auth.token;
  that.live = false;
  that.channel = {};
  that.roles = [];
  that.streamID = 0;
  that.client = new Discord.Client();
  
  that.krakenDefaults = {
    baseUrl: 'https://api.twitch.tv/kraken/',
    headers: {
      Accept: 'application/vnd.twitchtv.v5+json',
      'Client-ID': that.auth.clientID
    },
    json: true
  };
  
  that.kraken = request.defaults(that.krakenDefaults);
  
  that.init = () => {
    let guilds = that.client.guilds;
    guilds.forEach(function(g) {
      guild = g;
      let channel = guild.channels.find('id', that.config.modifyChannel);
      if(channel) {
        console.log("I am ready!");
        that.channel = channel;
      }
    });
  }
  
  that.verify = (message) => {
    return (message.channel.id === that.config.triggerChannel 
    && message.author.id === that.config.triggerUser);
  } 
  
  that.getUser = (username, callback) => {
    return that.kraken({
      url: 'users',
      qs: { login: username },
      callback: (err, { statusCode }, { _total, users }) => {
        if (err || statusCode !== 200 || _total === 0) {
          callback(err, null);
        }
        else {
          callback(null, users[0]);
        }
      }
    });
  }
  
  that.respond = (message) => {
    that.getUser(that.streamName, (err, data) => {
      if (err) {
        console.log('ERR', err);
      }	else {
        that.roles = message.guild.roles;
        that.streamID = data._id;
        that.getStream(that.streamID, (err, stream, channel) => {
          if (err) {
            console.log('ERR', err);
          } else if (stream == null) {
            console.log(that.streamName + ' is not live');
            that.setAllRoles(true);
            that.live = false;
          } else if (!that.live) {
            console.log(that.streamName + ' is live');
            that.setAllRoles(false);
            that.live = true;
            that.pollStream();
          }
        });
      }
    });
  }
  
  that.getStream = (id, callback) => {
    return that.kraken({
      url: 'streams/' + id,
      callback: (err, { statusCode }, { stream }) => {
        if (err || statusCode !== 200) {
          callback(err, null);
        }	else {
          callback(err, stream);
        }
      }
    });
  }
  
  that.setAllRoles = (toggle) => {
    that.Roles.forEach(function(role) {
      let role_t = that.roles.find('name', role);
      if (role_t) {
        that.channel.overwritePermissions(
          role_t, 
          {'SEND_MESSAGES': toggle}, 
          that.streamName + ' has gone live!'
        )
        .catch(console.log);
      }
    });
  }

  that.pollStream = () => {
    if (that.live) {
      that.getStream(that.streamID, (err, stream) => {
        if (err) {
          console.log('ERR', err);
        } else if (stream == null) {
          console.log(that.streamName + ' is not live');
          that.setAllRoles(true);
          that.live = false;
        }
      });
      setTimeout(() => that.pollStream(), 120000);
    }
  }
  
  return that;
}

exports = module.exports = Bot;