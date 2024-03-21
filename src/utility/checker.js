const lastVideo = require('./lastVideo');

module.exports = function (channel) {
    lastVideo.bind(this)(channel).then(async v => {
        const data = channel.lastVideo;

        const publishedAt = new Date(v.pubDate).getTime();

        if (data !== v.link && v && v.link && (!channel.lastPublish || channel.lastPublish < publishedAt)) {
            this._channels = this._channels.filter(v => v.youtube !== channel.youtube)

            channel.lastVideo = v.link;
            channel.lastPublish = publishedAt;

            this._channels.push(channel);

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