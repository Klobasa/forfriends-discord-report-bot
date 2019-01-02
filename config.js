var config = {
	admins: [process.env.ADMINS], // people without the admin role that are allowed to use the bot, this is their discord ID
	serverID: process.env.SERVER_ID, // discord server ID
	host: process.env.HOST, // MySQL IP or hostname
	user: process.env.USER, // MySQL username
	password: process.env.PASSWORD, // MySQL password
	database: process.env.DATABASE, // MySQL database
	reportsDB: process.env.REPORTSDB, // MySQL report location can't really change this 
	blockedDB: process.env.BLOCKEDDB, // MySQL blocked location can't really change this
	channelName: process.env.CHANNEL, // Channel the bot will post reports in, create the channel before running the bot!
	commandStr: "!ms ", // !ms block 76561198023897791
	SteamAPIKey: process.env.STEAM_API, // SteamAPI Key https://steamcommunity.com/dev/api
	adminRole: process.env.ADMIN_ROLE, // The role name of people that should be able to use the bot
	token: process.env.BOT_TOKEN // Bot Token
}
module.exports = config;
