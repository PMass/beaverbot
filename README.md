BeaverBot 
=========

BeaverBot is a Node.js bot intended to help Twitch streamers manage their Discord channels.

The current behavior is very basic, as this was written for a specific purpose. The bot will listen for a message in a specified channel by a specified user (ie: a live announcement) and revoke `SEND_MESSAGE` permissions to a list of roles in another specified channel (for instance, a self-promotion channel). These values are set in the following configurable files:

- `auth.json`
- `config.json`
- `roles.js`

`auth.json` should be populated with a Discord application token:

```
{
   "token": "<discord app token here>"
}
```

`config.json` should be populated with a twitch client ID, Discord channel and user ID's to capture the trigger, and a channel to modify:

```
{
   "clientID": "<twitch client ID>",
   "triggerChannel": "<Discord trigger channel ID>",
   "triggerUser": "<Discord trigger user ID>",
   "muteChannel": "<Discord modify channel ID>"
}
```

`roles.js` should be populated with an array of Discord roles to be affected:

```
const roles = ['@' + 'everyone', 'Regular', 'Subscriber']; //etc

module.exports = roles;
```

### Installing the bot

```
> npm install
```

### Running the bot

```
> node app.js <twitch username>
```