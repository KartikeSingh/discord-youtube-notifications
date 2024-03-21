const { Client } = require('discord.js');

const EventEmitter = require('events');
const lastVideo = require('./utility/lastVideo');
const checker = require('./utility/checker');

class notifier extends EventEmitter {
    /** The variable which stores the update time interval
     * @var {Number} _updateTime
     */
    _updateTime = 60000;

    /** This variable stores all the youtube channels
     * @var {Array} _channels array of youtube channels
     */
    _channels = [];

    /** The variable for checking state of the database
     * @var {Boolean} connect Whether database is connected & loaded
     */
    _connected = false;

    /**
     * Create a youtube notifier
     * @param {Client} client Your discord client instance
     * @param {Object} options The options for the notifier
     * @param {String} options.apiKey Your youtube api key
     * @param {Boolean} options.autoSend Whether you want the notifier to auto send the notifications, If false than upload event is triggered
     * @param {Number} options.updateTime Time interval to check for new updates.
     * @param {String} options.message The default message for youtube notifications.
     * @param {String} options.nolog Do you want to disable package's console log
     */
    constructor(client, options = {}) {
        super();

        const { apiKey, autoSend = true, message = "**{author}** uploaded a new video, Go check it out\n\nLink : {url}", updateTime = 10000, nolog = false } = options;

        if (!client) throw new Error("No client was provided")
        if (typeof (updateTime) !== "number" || updateTime < 2000) throw new TypeError("Update time should be a number and at least 2000");
        if (typeof (message) !== "string") throw new TypeError("The default message should be a string");
        if (typeof (autoSend) !== "boolean") throw new TypeError("The autoSend property should be a boolean");

        this.client = client;
        this.apiKey = apiKey;
        this._message = message;
        this._updateTime = updateTime
        this._autoSend = autoSend;
        this.noLog = typeof nolog === "boolean" ? nolog : false;
    }

    _load() {
        this?._channels?.forEach(v => {
            checker.bind(this)(v);
        })
    }

    /**
     * 
     * @param {String} youtubeId The youtube channel ID
     * @param {String} channelID The discord channel ID where you want to send notification ( Options )
     * @param {String} message The custom message for the notification
     * @returns 
     */
    async addNotifier(youtubeId, channelID, message) {
        if (typeof (youtubeId) !== "string") throw new Error("Youtube Channel ID should be a string");

        while (!this._connected) await new Promise(res => setTimeout(res, 500));

        if (this._channels.some(v => v.youtube === youtubeId)) return this.editNotifier(youtubeId, channelID, message)

        const last = await lastVideo.bind(this)({ youtube: youtubeId });

        if (last === false) throw new Error("Channel not found");

        this._channels.push({
            youtube: youtubeId,
            channel: channelID,
            lastVideo: last.link || "",
            message: message || this._message
        })

        return this;
    }

    /**
     * Remove a channel, If you do not want notifications
     * @param {String} youtubeId The youtube channel ID
     * @returns 
     */
    async removeNotifier(youtubeId) {
        if (typeof (youtubeId) !== "string") throw new Error("Youtube Channel ID should be a string");

        while (!this._connected) await new Promise(res => setTimeout(res, 500));

        if (!this._channels.filter(v => v.youtube === youtubeId).length === 0) throw new Error("No notifier found with the ID: " + youtubeId);

        this._channels = this._channels.filter(v => v.youtube !== youtubeId);

        return this;
    }

    /**
     * Edit a notifier
     * @param {String} youtubeId The youtube channel ID
     * @param {String} channelID The discord channel ID where you want to send notification ( Options )
     * @param {String} message The custom message for the notification
     * @returns 
     */
    async editNotifier(youtubeId, channelID, message) {
        if (typeof (youtubeId) !== "string") throw new Error("Youtube Channel ID should be a string");

        while (!this._connected) await new Promise(res => setTimeout(res, 500));

        if (!this._channels.some(v => v.youtube === youtubeId)) throw new Error("This channel do not exist");

        const data = this._channels.filter(v => v.youtube === youtubeId)[0];
        this._channels = this._channels.filter(v => v.youtube !== youtubeId);

        if (channelID && typeof (channelID) === "string") data.channel = channelID;
        if (message && typeof (message) === "string") data.message = message;

        this._channels.push(data);

        return this;
    }
}

module.exports = {
    notifier,
}