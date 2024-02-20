const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const KievRPSSecAuth = "FACSBBRaTOJILtFsMkpLVWSG6AN6C/svRwNmAAAEgAAACGtoWFdkFVMtUATNj+B24yvDCqnHSWEG32Qnvt76AZ0/mNodKyZlz/rRXrrKBt5UbG4/FbZeiEKqydGDVzoLcXZg44NGf7tlB2XFtSNronA6piA5Y6gWIIwQmpIGdzKP6AbuPxz8pOJt7kP+6Mm5txHZAVB+nqfvy9piXEFtN8vYK+JfuEpEvfYCJdOz8Q1WM7TbIpdlRHSIyFD4wpfkneadDDGLzu/TD0o8IttE30tww+7cKjgwBfd1DIFtizENWZJl36p1l8eh1bfks0Ri5l8jVZuPsAoA12ZfdKMpYrldEoe+c7m522y7kkIp/daoxGBee7X4vePMN4tFBBpKqLnBsOXZ3wL/sqxLDVLbYKs8AL8rIJxXSHwC7+tBrXaIch7ZEqN7yOeNtWjRIEDoJIbS/V1+qS9vzMT75Ak6CjWwPGmtPM+t5JwDIpn8NmpM/lM12suukWBpdKBlHqfBMu6t8YEXrDv59Sez3iSkxs7dsHIgyWFl0mEHRyIxFbNkUR4fAkqGR1n7Jms4sg5BSMWlB00fAFpuwj8Ykl/d/tDCKaalrOCyGjq84VR6v71EmkSmvUq5DQOIM23LtvhgwymEHaJy23Yf4a85vvcx5V3ZOF8apnWcbuVzPH0Ip7iAJF+CgHUD034ElGd9UM0lIpMLpKTzmH36JZbJb4fIEop7fLiQ6FMZt++jn+RlBnx9pPx7VHW/kRO/a5Zrq89vCXKZZZysNPyQiDqulJjyZ1dwwiSBc7Ryxbg0t3gZjKSUpetwCGkyX89dJgyjqRH7zhIolMh/n3vfWfQTL7Xds4XcWFITLKLnIGtPqPKft073mq/q4hbkFefOtY7C5ZmU8t37RevmL41++O2s+0RrMmezPJkX3y0rHiBF+9tQMk2n/CEKg7BCjtRPvGTSfUiiSUs1PopoEExC+GiyQ+qZwxfWGmwu7YjYoLtshji6zTvon5HicJ6BTb1Us9FIYvydBVAqRZGU3DvCZiTBFdviDp/ogVOfch2YJaPN+d2+9Q2UpPOLG0pMmHaVYsJcK/Gq7//wbQhqjmYZhpQF4SygJ9PVYTCoJACMqPpxcQLyBwmlsGwiMyETp8wgR+Lrke2ysVcka3WOpo4RJI9n4hwWIO0V0oPZta3eqsCVg1gGqSHO4YX3oc7xUtU79w+aop0+/PwVwlkZGFVrf4Hyc10SlTwmfEFL9qMlZfZgwiJH8yXAK5I/F6W+L+iM25TtkZ4nmxIMDoYJtXTDQEgERzVWiX7tjoHNfxKJi1SSzU2q/TAvh+4gMLVcvcpctZRTmHU0l/KASI9V8lrdBNtyVVNr0qKou/hrAgl0+0TW+1HsEAaDPsohK4iLz+qEZImVQJUnevhUp+TnWnOVTHnrbLqKZgr8aGolXrYQ/yRl8pttJyFsTCge6VELMQZ4hDD9pAvNDOnne2Zl3iRNXDUdEJ9THFFQk7t7Pd4Mnsat1v2FPeAHmJ6ftcOSQn2ou5IUAAkwcZGeQyFAm0pcYBs+RYlU93wT";
const _U = "1N6XdZoEjrs9bNG3W07jM2krHSUQ0vYNaIAvNGbFVnz7xSZZSDfDUTqYW3g7IEKvGoxieQVFUmX8xBnN5O10gBbCENlfZiY5GPbPlyAwaPUM7lRzYXm3sFtxoQjyZEVcBCwgT-pLt9L8_hVtK2L_CQzjIdgfLIPKhWZymDiBa356Y31UQ_0A1wXZTpVXrN2tMct54TIh3q6Lvf-Y8ucNDI6M3NVjK46oOOi4bZEX43sI";

module.exports.config = {
	name: "dalle",
	version: "1.0",
	role: 0,
	credits: "cliff",//api by Samir
	hasPrefix: false,
	description: "dalle",
	usages: "{prefix}dalle <search query> -<number of images>",
	cooldown: 0,
	aliases: ["dalle"],
};

module.exports.run = async function ({ api, event, args }) {
	const keySearch = args.join(" ");
	const indexOfHyphen = keySearch.indexOf('-');
	const keySearchs = indexOfHyphen !== -1 ? keySearch.substr(0, indexOfHyphen).trim() : keySearch.trim();
	const numberSearch = parseInt(keySearch.split("-").pop().trim()) || 4;

	try {
		const res = await axios.get(`https://api-dalle-gen.onrender.com/dalle3?auth_cookie_U=${_U}&auth_cookie_KievRPSSecAuth=${KievRPSSecAuth}&prompt=${encodeURIComponent(keySearchs)}`);
		const data = res.data.results.images;

		if (!data || data.length === 0) {
			api.sendMessage("No images found for the provided query.", event.threadID, event.messageID);
			return;
		}

		const imgData = [];
		for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
			const imgResponse = await axios.get(data[i].url, { responseType: 'arraybuffer' });
			const imgPath = path.join(__dirname, 'cache', `${i + 1}.jpg`);
			await fs.outputFile(imgPath, imgResponse.data);
			imgData.push(fs.createReadStream(imgPath));
		}

		await api.sendMessage({
			attachment: imgData,
			body: `Here's your generated image`
		}, event.threadID, event.messageID);

	} catch (error) {
		console.error(error);
		api.sendMessage("cookie of the command. Is expired", event.threadID, event.messageID);
	} finally {
		await fs.remove(path.join(__dirname, 'cache'));
	}
};
