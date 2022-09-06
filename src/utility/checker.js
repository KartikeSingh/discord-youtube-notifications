const lastVideo = require('./lastVideo');
const quick = require('quick.db');
const Channel = require('../models/channel');

module.exports = function (channel) {
    lastVideo.bind(this)(channel).then(async v => {
        const data = channel.lastVideo;

        if (data !== v.link && v && v.link) {
            this._channels = this._channels.filter(v => v.youtube !== channel.youtube)

            this._mongoURI === "quick.db" ? quick.set('channels', this._channels) : await Channel.findOneAndUpdate({ youtube: channel.youtube }, { lastVideo: v.link });

            channel.lastVideo = v.link;

            this._channels.push(channel)

            channel.author = v.author;
            channel.title = v.title;
            channel.link = v.link;
            channel.thumbnail = v.thumbnail;

            if (!this._autoSend) return this.emit("upload", this.client, channel);

            try {
                (await this.client.channels.fetch(channel.channel))?.send({
                    embeds: [{
                        description: channel.message.replace(/{author}/ig, v.author)
                            .replace(/{thumbnail}/ig, v.thumbnail)
                            .replace(/{title}/ig, v.title)
                            .replace(/{url}/ig, v.link)
                    }]
                })
            } catch (e) {
                console.warn(`[ Youtube Notifier ] : I was unable to send message channel : ${channel.channel} for youtube channel ${channel.youtube}`);
            }
        }
    })
}