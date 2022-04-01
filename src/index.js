const quick = require('quick.db');
const mongoose = require('mongoose');
const channel = require('./models/channel');
const lastVideo = require('./utility/lastVideo');
const checker = require('./utility/checker');
const EventEmitter = require('events');
const { Client } = require('discord.js');

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
     * @param {String} options.mongoURI Your mongo db URI to connect database with it.
     * @param {Number} options.updateTime Time interval to check for new updates.
     * @param {String} options.message The default message for youtube notifications.
     */
    constructor(client, options = {}) {
        super();

        const { apiKey, autoSend = true, mongoURI = "quick.db", message = "**{author}** uploaded a new video, Go check it out\n\nLink : {url}", updateTime = 60000 } = options;

        if (!client) throw new Error("No client was provided")
        if (typeof (updateTime) !== "number" || updateTime < 60000) throw new TypeError("Update time should be a number and at least 10000");
        if (typeof (message) !== "string") throw new TypeError("The default message should be a string");
        if (typeof (autoSend) !== "boolean") throw new TypeError("The autoSend property should be a boolean");

        this.client = client;
        this.apiKey = apiKey;
        this._mongoURI = mongoURI;
        this._message = message;
        this._updateTime = updateTime
        this._autoSend = autoSend;

        if (mongoURI.toLowerCase() === "quick.db") {
            this._quickSetup();

            this._connected = true;
            setInterval(() => this._load(), this._updateTime);
        } else {
            this._mongoSetup().then(() => {
                this._connected = true;
                setInterval(() => this._load(), this._updateTime);
            })
        }
    }

    async _mongoSetup() {
        await mongoose.connect(this._mongoURI).catch(e => { throw new Error("Invalid Mongo URI was provided, type quick.db or don't provide the uri at all, If you want to work without mongo") });
        this._channels = await channel.find() || [];
    }

    _quickSetup() {
        if (!quick.has("channels")) quick.set("channels", [])
        this._channels = quick.get("channels") || [];
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

        this._mongoURI === "quick.db" ? quick.set("channels", this._channels) : await channel.create(this._channels[this._channels.length - 1]);

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

        this._mongoURI === "quick.db" ? quick.set("channels", this._channels) : await channel.findOneAndDelete({ youtube: youtubeId });

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

        this._mongoURI === "quick.db" ? quick.set("channels", this._channels) : await channel.findOneAndUpdate({ youtube: youtubeId }, data);

        return this;
    }
}

module.exports = {
    notifier,
    channelModel: channel,
}