const axios = require("axios");
const fs = require("fs");
const cookie = 'fwjU8yQqoChhkIKuxNZuzuZ6Il_3Cp2S832gNK2Akgtq3nqrmi2kQaFFcnnjIFMaWB9NmQ.';

module.exports.config = {
	name: "gemini",
	version: "1.0",
	credits: "rehat--",
	cooldown: 5,
	role: 0,
	hasPrefix: false,
	description: "Artificial Intelligence Google Gemini",
	usages: "{pn} <query>",
};

module.exports.run = async function ({ api, event, args, message }) {
	const uid = event.senderID;
	const prompt = args.join(" ");

	if (!prompt) {
		message.reply("Please enter a query.");
		return;
	}

	if (prompt.toLowerCase() === "clear") {
		clearHistory();
		const clear = await axios.get(`https://project-gemini-daac55836bf7.herokuapp.com/api/gemini?query=clear&uid=${uid}&cookie=${cookie}`);
		message.reply(clear.data.message);
		return;
	}

	let apiUrl = `https://project-gemini-daac55836bf7.herokuapp.com/api/gemini?query=${encodeURIComponent(prompt)}&uid=${uid}&cookie=${cookie}`;

	if (event.type === "message_reply") {
		const imageUrl = event.messageReply.attachments[0]?.url;
		if (imageUrl) {
			apiUrl += `&attachment=${encodeURIComponent(imageUrl)}`;
		}
	}

	try {
		const response = await axios.get(apiUrl);
		const result = response.data;

		let content = result.message;
		let imageUrls = result.imageUrls;

		let replyOptions = {
			body: content,
		};

		if (Array.isArray(imageUrls) && imageUrls.length > 0) {
			const imageStreams = [];

			if (!fs.existsSync(`${__dirname}/cache`)) {
				fs.mkdirSync(`${__dirname}/cache`);
			}

			for (let i = 0; i < imageUrls.length; i++) {
				const imageUrl = imageUrls[i];
				const imagePath = `${__dirname}/cache/image${i + 1}.png`;

				try {
					const imageResponse = await axios.get(imageUrl, {
						responseType: "arraybuffer",
					});
					fs.writeFileSync(imagePath, imageResponse.data);
					imageStreams.push(fs.createReadStream(imagePath));
				} catch (error) {
					console.error("Error occurred while downloading and saving the image:", error);
					message.reply('An error occurred.');
				}
			}

			replyOptions.attachment = imageStreams;
		}

		message.reply(replyOptions);
	} catch (error) {
		message.reply('An error occurred.');
		console.error(error.message);
	}
};
