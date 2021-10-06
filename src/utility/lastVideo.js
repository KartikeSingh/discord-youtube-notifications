const parser = new (require('rss-parser'))();

module.exports = (youtubeChannel) => {
    return new Promise(res => {
        parser.parseURL("https://www.youtube.com/feeds/videos.xml?channel_id=" + youtubeChannel.youtube).then(v => {
            res(v.items[0] || {});
        }).catch(e => {
            res(false);
        })
    })
}