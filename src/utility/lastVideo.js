const { default: axios } = require('axios');

const parser = new (require('rss-parser'))();

module.exports = function (youtubeChannel) {
    return new Promise(res => {
        if (this.apiKey) {
            axios.get(`https://www.googleapis.com/youtube/v3/search?key=${this.apiKey}&channelId=${youtubeChannel.youtube}&part=snippet,id&order=date&maxResults=1`).then(v => {

                if (!v.data.items[0]) return res({});

                let data = {
                    title: v.data.items[0].snippet.title,
                    author: v.data.items[0].snippet.channelTitle,
                    thumbnail: (v.data.items[0].snippet.thumbnails.high || v.data.items[0].snippet.thumbnails.default).url,
                    link: `https://www.youtube.com/watch?v=${v.data.items[0].id.videoId}`,
                    pubDate: v.data.items[0].snippet.publishedAt,
                }

                res(data);
            }).catch(e => {
                res(false);
            })
        } else {
            parser.parseURL("https://www.youtube.com/feeds/videos.xml?channel_id=" + youtubeChannel.youtube).then(v => {
                res(v.items[0] || {});
            }).catch(e => {
                res(false);
            })
        }
    })
}