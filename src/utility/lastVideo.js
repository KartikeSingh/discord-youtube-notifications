const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const parser = new (require('rss-parser'))();

module.exports = function (youtubeChannel) {
    return new Promise(async res => {
        if (this.apiKey) {
            const playlistData = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${youtubeChannel.youtube}&key=${this.apiKey}`)

            if(![200, 201].includes(playlistData.status)) return res({})
            
            const v = await playlistData.json();

            if(v.pageInfo.totalResults < 1) return res({});

            let playlistId = v.items[0].contentDetails.relatedPlaylists.uploads;

            const data = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1&key=${this.apiKey}`)

            if(![200, 201].includes(data.status)) return res({})

            const e = await data.json();

            if(e.pageInfo.totalResults < 1) return res({});

            let ytData = {
                title: e.items[0].snippet.title,
                author: e.items[0].snippet.channelTitle,
                thumbnail: (e.items[0].snippet.thumbnails.high || e.items[0].snippet.thumbnails.default).url,
                link: `https://www.youtube.com/watch?v=${e.items[0].snippet.resourceId.videoId}`,
                pubDate: e.items[0].snippet.publishedAt,
            }

            return res(ytData);
        } else {
            parser.parseURL("https://www.youtube.com/feeds/videos.xml?channel_id=" + youtubeChannel.youtube).then(v => {
                res(v.items[0] || {});
            }).catch(() => {
                res(false);
            })
        }
    })
}
