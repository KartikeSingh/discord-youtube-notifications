const { default: axios } = require('axios');

const parser = new (require('rss-parser'))();

module.exports = function (youtubeChannel) {
    return new Promise(res => {
        if (this.apiKey) {
            axios.get(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${youtubeChannel.youtube}&key=${this.apiKey}`).then(v => {

                if(!v.data.items[0]) res(false);

                let playlistId = v.data.items[0].contentDetails.relatedPlaylists.uploads;

                axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${this.apiKey}`).then(e => {
                        
                        if(!e.data.items[0]) res(false);
    
                        let data = {
                            title: e.data.items[0].snippet.title,
                            author: e.data.items[0].snippet.channelTitle,
                            thumbnail: (e.data.items[0].snippet.thumbnails.high || e.data.items[0].snippet.thumbnails.default).url,
                            link: `https://www.youtube.com/watch?v=${e.data.items[0].snippet.resourceId.videoId}`,
                            pubDate: e.data.items[0].snippet.publishedAt,
                        }

                        res(data);
                }).catch(() => {
                    res(false)
                })
            }).catch(() => {
                res(false)
            })
        } else {
            parser.parseURL("https://www.youtube.com/feeds/videos.xml?channel_id=" + youtubeChannel.youtube).then(v => {
                res(v.items[0] || {});
            }).catch(() => {
                res(false);
            })
        }
    })
}
