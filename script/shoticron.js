const axios = require('axios');
const fs = require('fs');
const request = require('request');

const shotiAutoState = {};
const shotiAutoInterval = {};
let videoCounter = 0;
let errorVideoCounter = 0;
const lastVideoError = {};
const defaultInterval = 60 * 60 * 1000; 

module.exports.config = {
	name: 'shoticron',
	version: '1.0',
	hasPermission: 2,
	credits: 'Marjhxn',
	usePrefix: true,
	description: 'Random Shoties',
	commandCategory: 'fun',
	usages: '',
	cooldowns: 0,
};

const shoticron = async (api, event, threadID) => {
	try {
		let response = await axios.post('https://shoti-server-5b293365cb713b.replit.app/api/v1/get', { apikey: '$shoti-1hmr2epbp9p95ovcr68' });
		console.log('API Response:', response.data);

		if (response.data.error) {
			throw new Error(`API Error: ${response.data.error}`);
		}

		const userInfo = response.data.data.user;
		const videoInfo = response.data.data;
		const title = videoInfo.title;
		const durations = videoInfo.duration;
		const region = videoInfo.region;
		const username = userInfo.username;
		const nickname = userInfo.nickname;

		videoCounter++;

		const tid = event.threadID;
		const file = fs.createWriteStream('temp_video.mp4');
		const rqs = request(encodeURI(response.data.data.url));
		rqs.pipe(file);

		file.on('finish', () => {
			api.sendMessage({
				body: `―――――――――――――――\n➸ 𝗧𝗶𝘁𝗹𝗲:  ${title}\n➸ 𝘂𝘀𝗲𝗿𝗻𝗮𝗺𝗲:  @${username}\n➸ 𝗻𝗶𝗰𝗸𝗻𝗮𝗺𝗲: ${nickname}\n➸ 𝗱𝘂𝗿𝗮𝘁𝗶𝗼𝗻:  ${durations}\n―――――――――――――――`,
				attachment: fs.createReadStream('temp_video.mp4'),
			}, threadID, () => {
				fs.unlink('temp_video.mp4', (err) => {
					if (err) {
						console.error('Error deleting temporary file:', err);
					}
				});
			});
		});
	} catch (error) {
		console.error('Error fetching or sending the video:', error);
		lastVideoError[threadID] = error.message;
		videoCounter++;
		errorVideoCounter++;
	}
};

module.exports.run = async ({ api, event }) => {
	const threadID = event.threadID;
	const commandArgs = event.body.toLowerCase().split(' ');

	const allowedAdminUID = '100027867581039';
	if (commandArgs[1] === 'setinterval') {
		const newIntervalValue = parseFloat(commandArgs[2]);
		const newIntervalUnit = commandArgs[3]?.toLowerCase();

		if (!isNaN(newIntervalValue) && newIntervalValue > 0) {
			let newInterval;

			if (newIntervalUnit === 'hour' || newIntervalUnit === 'hours') {
				newInterval = newIntervalValue * 60 * 60 * 1000; // Convert hours to milliseconds
				const unit = newIntervalValue === 1 ? 'hour' : 'hours';
				api.sendMessage(`―――――――――――――――\n➸ Interval time set to ${newIntervalValue} ${unit}.\n―――――――――――――――`, threadID);
			} else if (newIntervalUnit === 'minute' || newIntervalUnit === 'minutes') {
				newInterval = newIntervalValue * 60 * 1000; // Convert minutes to milliseconds
				const unit = newIntervalValue === 1 ? 'minute' : 'minutes';
				api.sendMessage(`―――――――――――――――\n➸ Interval time set to ${newIntervalValue} ${unit}.\n―――――――――――――――`, threadID);
			} else {
				api.sendMessage('―――――――――――――――\n➸ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝘂𝗻𝗶𝘁. 𝗣𝗹𝗲𝗮𝘀𝗲 𝘂𝘀𝗲 "𝗺𝗶𝗻𝘂𝘁𝗲𝘀" 𝗼𝗿 "𝗵𝗼𝘂𝗿𝘀".\n―――――――――――――――', threadID);
				return;
			}

			shotiAutoInterval[threadID] = newInterval;
		} else {
			api.sendMessage('―――――――――――――――\n➸ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗶𝗻𝘁𝗲𝗿𝘃𝗮𝗹 𝘁𝗶𝗺𝗲. 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗽𝗼𝘀𝗶𝘁𝗶𝘃𝗲 𝗻𝘂𝗺𝗯𝗲𝗿.\n―――――――――――――――', threadID);
		}
		return;
	} else if (commandArgs[1] === 'interval') {
		const currentInterval = shotiAutoInterval[threadID] || defaultInterval;
		const unit = currentInterval === 60 * 60 * 1000 ? 'hour' : 'minute';
		api.sendMessage(`―――――――――――――――\n➸ Current interval time is set to ${currentInterval / (unit === 'hour' ? 60 * 60 * 1000 : 60 * 1000)} ${unit}.\n―――――――――――――――`, threadID);
		return;
	} else if (commandArgs[1] === 'on') {
		if (!shotiAutoState[threadID]) {
			shotiAutoState[threadID] = true;
			const intervalUnit = shotiAutoInterval[threadID] ? (shotiAutoInterval[threadID] === 60 * 60 * 1000 ? 'hour' : 'minute') : 'hour';
			const intervalValue = shotiAutoInterval[threadID] ? shotiAutoInterval[threadID] / (intervalUnit === 'hour' ? 60 * 60 * 1000 : 60 * 1000) : 1;
			const intervalMessage = `will send video every ${intervalValue} ${intervalUnit}${intervalValue === 1 ? '' : 's'}`;

			api.sendMessage(`―――――――――――――――\n➸ 𝗦𝗵𝗼𝘁𝗶𝗰𝗿𝗼𝗻 𝗘𝗻𝗮𝗯𝗹𝗲𝗱!, ${intervalMessage}.\n―――――――――――――――`, threadID);

			shoticron(api, event, threadID);

			setInterval(() => {
				if (shotiAutoState[threadID]) {
					shoticron(api, event, threadID);
				}
			}, shotiAutoInterval[threadID] || defaultInterval);
		} else {
			api.sendMessage('―――――――――――――――\n➸ 𝗦𝗵𝗼𝘁𝗶𝗰𝗿𝗼𝗻 𝗶𝘀 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗘𝗻𝗮𝗯𝗹𝗲𝗱.\n―――――――――――――――', threadID);
		}
		return;
	} else if (commandArgs[1] === 'off') {
		shotiAutoState[threadID] = false;
		api.sendMessage('―――――――――――――――\n➸ 𝗦𝗵𝗼𝘁𝗶𝗰𝗿𝗼𝗻 𝗗𝗶𝘀𝗮𝗯𝗹𝗲𝗱.', threadID);
		return;
	} else if (commandArgs[1] === 'status') {
		const statusMessage = shotiAutoState[threadID] ? 'on' : 'off';
		const intervalMessage = shotiAutoInterval[threadID] ? `Interval time set to ${shotiAutoInterval[threadID] / (shotiAutoInterval[threadID] === 60 * 60 * 1000 ? 60 : 1000)} minutes.` : 'Interval time not set. Using the default 1 -hour interval.';
				const errorMessage = lastVideoError[threadID] ? `Last video error: ${lastVideoError[threadID]}` : '';

				api.sendMessage(`―――――――――――――――\n➸ Command feature is currently ${statusMessage}.\n➸ Total videos sent: ${videoCounter}\n➸ Total error videos: ${errorVideoCounter}\n${errorMessage}\n―――――――――――――――`, threadID);
				return;
			} else if (commandArgs[1] === 'resetcount') {
				// Check if the user has permission to reset counts
				if (event.senderID === allowedAdminUID) {
					videoCounter = 0;
					errorVideoCounter = 0;
					api.sendMessage('―――――――――――――――\n➸ 𝗩𝗶𝗱𝗲𝗼 𝗰𝗼𝘂𝗻𝘁𝘀 𝗵𝗮𝘃𝗲 𝗯𝗲𝗲𝗻 𝗿𝗲𝘀𝗲𝘁.\n―――――――――――――――', threadID);
				} else {
					api.sendMessage('―――――――――――――――\n➸ 𝗬𝗼𝘂 𝗱𝗼 𝗻𝗼𝘁 𝗵𝗮𝘃𝗲 𝗽𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻 𝘁𝗼 𝗿𝗲𝘀𝗲𝘁 𝗰𝗼𝘂𝗻𝘁𝘀.\n―――――――――――――――', threadID);
				}
				return;
			}

			api.sendMessage('―――――――――――――――\n➸ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗰𝗼𝗺𝗺𝗮𝗻𝗱.\𝗻\𝗻\𝗻➸  "𝘀𝗵𝗼𝘁𝗶𝗰𝗿𝗼𝗻 𝗼𝗻", "𝘀𝗵𝗼𝘁𝗶𝗰𝗿𝗼𝗻 𝗼𝗳𝗳" - 𝘁𝗼 𝘁𝘂𝗿𝗻 𝗢𝗡 𝗼𝗿 𝘁𝘂𝗿𝗻 𝗢𝗙𝗙.\𝗻\𝗻\𝗻➸ "𝘀𝗵𝗼𝘁𝗶𝗰𝗿𝗼𝗻 𝘀𝗲𝘁𝗶𝗻𝘁𝗲𝗿𝘃𝗮𝗹 <𝗺𝗶𝗻𝘂𝘁𝗲𝘀/𝗵𝗼𝘂𝗿𝘀>" - 𝘀𝗲𝘁 𝘁𝗵𝗲 𝘁𝗶𝗺𝗲𝗿 𝗳𝗼𝗿 𝘃𝗶𝗱𝗲𝗼\𝗻\𝗻\𝗻➸ "𝘀𝗵𝗼𝘁𝗶𝗰𝗿𝗼𝗻 𝗶𝗻𝘁𝗲𝗿𝘃𝗮𝗹" - 𝗰𝗵𝗲𝗰𝗸 𝘁𝗵𝗲 𝗶𝗻𝘁𝗲𝗿𝘃𝗮𝗹\𝗻\𝗻\𝗻➸ "𝘀𝗵𝗼𝘁𝗶𝗰𝗿𝗼𝗻 𝘀𝘁𝗮𝘁𝘂𝘀" - 𝗰𝗵𝗲𝗰𝗸 𝘁𝗵𝗲 𝘀𝘁𝗮𝘁𝘂𝘀 𝗼𝗳𝗳 𝗰𝗼𝗺𝗺𝗮𝗻𝗱\n―――――――――――――――', threadID);
			};
