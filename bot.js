const request = require('request');
const Discord = require('discord.js');

function Bot (config) {
  let that = {};
  
  that.auth = config.Auth;
  that.config = config.Config;
  
  that.streamName = process.argv.slice(2)[0];
  that.token = that.auth.token;
  that.live = false;
  that.channel = {};
  that.guild = {};
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
    that.getChannel();
    if (that.channel) {
      console.log("I am ready!");
    } else {
      console.log("Channel not found!");
    }
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
  
  that.getChannel = () => {
    that.client.guilds.forEach(function(g) {
      guild = g;
      let channel = guild.channels.find('id', that.config.modifyChannel);
      if (channel) {
        that.channel = channel;
        that.guild = guild;
      }
    });
  }
  
  that.respond = (message) => {
    that.getUser(that.streamName, (err, data) => {
      if (err) {
        console.log('ERR', err);
      }	else {
        that.roles = that.guild.roles;
        that.streamID = data._id;
        that.getStream(that.streamID, (err, stream, channel) => {
          if (err) {
            console.log('ERR', err);
          } else if (stream == null) {
            console.log(that.streamName + ' is not live');
            that.modifyRoles(true);
            that.live = false;
          } else if (!that.live) {
            console.log(that.streamName + ' is live');
            that.modifyRoles(false);
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
  
  that.modifyRoles = (toggle) => {
    that.roles.forEach(function(role) {
      if (role && role.name != 'Mods') {
        that.channel.overwritePermissions(
          role, 
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
          that.modifyRoles(true);
          that.live = false;
        }
      });
      setTimeout(() => that.pollStream(), 120000);
    }
  }
  
  return that;
}

exports = module.exports = Bot;