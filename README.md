BeaverBot 
=========

BeaverBot is a Node.js bot intended to help Twitch streamers manage their Discord channels.

The current behavior is very basic, as this was written for a specific purpose. The bot is triggered by the presenceUpdate event, and if a specified user begins streaming a game the bot will revoke `SEND_MESSAGE` permissions to all roles in a specified channel (for instance, a self-promotion channel).

`auth.json` should be populated with Discord application token and Twitch client ID.

```
{
   "token": "<discord app token here>",
   "clientID": "<twitch client ID>"
}
```

`config.json` should be populated with a user ID to trigger the behavior, and a channel ID to be modified by the behavior:

```
{
   "triggerUser": "<Discord trigger user ID>",
   "modifyChannel": "<Discord modify channel ID>"
}
```

### Installing the bot

```
> npm install
```

### Running the bot

```
> node app.js <twitch username>
```