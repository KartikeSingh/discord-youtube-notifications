const lastVideo = require('./lastVideo');
const quick = require('quick.db');
const Channel = require('../models/channel');

module.exports = function (channel) {
    lastVideo.bind(this)(channel).then(async v => {
        const data = channel.lastVideo;

        const publishedAt = new Date(v.pubDate).getTime();

        if (data !== v.link && v && v.link && (!channel.lastPublish || channel.lastPublish < publishedAt)) {
            this._channels = this._channels.filter(v => v.youtube !== channel.youtube)

            if (this._mongoURI === "quick.db") quick.set('channels', this._channels);

            channel.lastVideo = v.link;
            channel.lastPublish = publishedAt;

            this._channels.push(channel);

            this._mongoURI === "quick.db" ? quick.set('channels', this._channels) : await Channel.findOneAndUpdate({ youtube: channel.youtube }, { lastVideo: v.link, lastPublish: publishedAt });

            channel.author = v.author;
            channel.title = v.title;
            channel.link = v.link;
            channel.thumbnail = v.thumbnail;
            channel.pubDate = publishedAt;

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
                if (!this.noLog) console.warn(`[ Youtube Notifier ] : I was unable to send message channel : ${channel.channel} for youtube channel ${channel.youtube}`);
            }
        }
    })
}