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
  
  that.verify = (member) => {
    console.log(member.id, member.id === that.config.triggerUser ? '=' : '!', '=', that.config.triggerUser);
    return (member.id === that.config.triggerUser);
  }
  
  that.getActivity = (member) => {
    if (member.presence.game)
      return [member.presence.game.streaming ? 'streaming' : 'playing', member.presence.game.name];
    return [null, null];
  }
  
  that.getMemberUpdate = (oldMember, newMember) => {
    let [member, update, activity, game] = [null, null, null, null];
    if (newMember.presence.game) {
      update = 'has started';
      member = newMember;
    } else if (oldMember.presence.game) {
      update = 'has stopped';
      member = oldMember;
    } else {
      return [member, update, activity, game];
    }
    [activity, game] = that.getActivity(member);
    console.log(member.user.username, update, activity, game);
    return [member, update, activity, game];
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
  
  that.respond = (update) => {
    that.getUser(that.streamName, (err, data) => {
      if (err) {
        console.log('ERR', err);
      }	else {
        that.getStream(data._id, (err, stream) => {
          if (err) {
            console.log('ERR', err);
          } else if (stream == null) { 
            console.log(that.streamName + ' is not live');
            that.modifyRoles(true);
            that.live = false;
          } else if ((!that.live && update == 'has started') || (stream.stream_type == 'live')) { 
            console.log(that.streamName + ' is live');
            that.modifyRoles(false);
            that.live = true;
          } else if (update == 'has stopped') {
            console.log(that.streamName + ' might be live?');
            setTimeout(() => that.respond(update), 120000);
          } else {
            console.log(stream, update);
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
    that.guild.roles.forEach(function(role) {
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
  
  return that;
}
exports = module.exports = Bot;
