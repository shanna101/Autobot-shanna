module.exports.config = {
    name: "shoti",
    version: "1.0.0",
    credits: "Marjhxn",
    description: "Generate random tiktok girl videos",
    hasPermssion: 0,
    commandCategory: "other",
    usage: "[shoti]",
    cooldowns: 5,
    dependencies: [],
    usePrefix: true,
};

module.exports.run = async function({
    api,
    event
}) {
    try {
        const axios = require("axios");
        const request = require("request");
        const fs = require("fs");
        api.sendMessage(`⏱️ | Sending Shoti Please Wait...`, event.threadID, event.messageID);
        let response = await axios.post(
            "https://shoti-server-5b293365cb713b.replit.app/api/v1/get", {
                apikey: "$shoti-1hmr2epbp9p95ovcr68",
            },
        );

        const userInfo = response.data.data.user;
        const videoInfo = response.data.data;
        const title = videoInfo.title;
        const durations = videoInfo.duration;
        const region = videoInfo.region;
        const username = userInfo.username;
        const nickname = userInfo.nickname;

        var file = fs.createWriteStream(__dirname + "/cache/temp_video.mp4");
        var rqs = request(encodeURI(response.data.data.url));
        rqs.pipe(file);
        file.on("finish", () => {
            return api.sendMessage({
                    body: `𝗛𝗘𝗥𝗘'𝗦 𝗬𝗢𝗨𝗥 𝗦𝗛𝗢𝗧𝗜 𝗩𝗜𝗗𝗘𝗢!\n𝖳𝗂𝗍𝗅𝖾: ${title}\n𝖴𝗌𝖾𝗋𝗇𝖺𝗆𝖾: @${username}\n𝖭𝗂𝖼𝗄𝗇𝖺𝗆𝖾: ${nickname}\n𝖣𝗎𝗋𝖺𝗍𝗂𝗈𝗇: ${durations}\n𝖱𝖾𝗀𝗂𝗈𝗇: ${region}`,
                    attachment: fs.createReadStream(__dirname + "/cache/temp_video.mp4"),
                },
                event.threadID,
                event.messageID,
            );
        });
        file.on("error", (err) => {
            api.sendMessage(`Shoti Error: ${err}`, event.threadID, event.messageID);
        });
    } catch (error) {
        api.sendMessage(
            "An error occurred while generating video:" + error,
            event.threadID,
            event.messageID,
        );
    }
};