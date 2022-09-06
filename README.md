# Installations
```
npm i discord-bot-youtube-notifications
```

# What?
An module to easily recive Youtube uploads notification.

# Why?
- Easy to use.
- Active Support on [discord server](https://discord.gg/XYnMTQNTFh).
- No API key needed.

# Note
- At least Node JS `14` is `required`.
- The feeds thing of youtube takes some time to update, so the notifications might be bit slow.

# How ?
- ## Basic NOtifications
```js
const youtube = require('discord-bot-youtube-notifications');

// The client is the Discord Client
const Notifier = new youtube.notifier(client);

const youtube_channel_id = "UCSqcbw8r8TZKYUhx4mufvNg";
const discord_channel_id = "732883841395720213";

// The channel ID is options
Notifier.addNotifier(youtube_channel_id, discord_channel_id);
```

- ## Custom Message
```js
const youtube = require('discord-bot-youtube-notifications');

const Notifier = new youtube.notifier(client, {
    // If you do not add message parameter in addNotifier than this message is used
    message: "Hello @everyone, **{author}** just publish a cool video called **{title}**\nGo show your support\n\nurl : {url}\n\nThumbnail: {thumbnail}"
});

const youtube_channel_id = "UCSqcbw8r8TZKYUhx4mufvNg";
const discord_channel_id = "732883841395720213";

Notifier.addNotifier(youtube_channel_id, discord_channel_id);

// A different message
Notifier.addNotifier("Another Channel ID", discord_channel_id, "Hello guys, A nerd called **{author}** just publish a shit video called **{title}**\nGo dislike it\n\nurl : {url}\nThumbnail: {thumbnail}");
```

- ## Advanced options
```js
const youtube = require('discord-bot-youtube-notifications');

const Notifier = new youtube.notifier(client, {
    // Default message
    message: "Hello @everyone, **{author}** just publish a cool video called **{title}**\nGo show your support\n\nurl : {url}",

    // Time interval to check for new uploads
    updateTime: 60000, // in milliseconds,

    // Give the mongo URI if you wanna save data in mongoose otherwise quick.db is used
    mongoURI: "mongo+srv://something",

    // Auto send the embed to the provided channel
    autoSend: true, // if false you will get A "upload" event

    // The youtube data v3 API key, Send this if you want updates to be fast and precise because without the key it take 10-15 minutes more time to get latest videos
    apiKey: "the key",
});
```

- ## Listening to events
```js
Notifier.on("upload", (client, data) => {
  // Do something with your data
});

// Example Data 
const data = {
    youtube: "UCSqcbw8r8TZKYUhx4mufvNg", // The Youtube channel ID
    channel: channelID, // The discord channel ID
    lastVideo: last.link || "", // Latest video link
    message: "new upload", // Custom message
    author: "Krazy Developer", // The name of youtube channel
    title: "How to code", // title of the video
    link: "https://www.youtube.com/watch?v=CmK5JLt0GQ4", // Link of the video
    thumbnail: "https://i.ytimg.com/vi/E7sZqOnZUrA/hqdefault.jpg", // image url of the thumbnail
}
```

- ## Utility functions
```js
// To edit the notifier's channel ID, or the message, If you don't wanna change one of the property just give undefined in its place
Notifier.editNotifier(youtubeId, channelID, message);

// To remove a notifier
Notifier.removeNotifier(youtubeId)
```

# Support
for support or issues or queries contace me on my [discord server](https://discord.gg/XYnMTQNTFh).
