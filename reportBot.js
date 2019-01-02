const Discord = require('discord.js');
var SteamIDMaker = require('steamid');
var dateFormat = require('dateformat');
//var request = require("request");
const client = new Discord.Client();
var mysql      = require('mysql');
var reportDB = mysql.createConnection({
  host     : process.env.HOST,
  user     : process.env.USER,
  password : process.env.PASSWORD,
  database : process.env.DATABASE
});
var reportsDB = process.env.REPORTSDB;
var channelName = process.env.CHANNEL;
var blockedDB = process.env.BLOCKEDDB;
var commandStr = "!ms";
var SBconnected = false;
var SteamAPIKey = process.env.STEAM_API;

var guild;
var admin;
var channelReport;
var admins = [];
var blocked = [];

function isAdmin(user) {

	if (admin.members.exists('user',user) || admins.indexOf(user.id) >= 0) {
		return true;
	} 
	return false;
}
function isBlocked(ID) {
	ID = ID.getSteamID64().toString();
	for (var i = blocked.length - 1; i >= 0; i--) {
		if (blocked[i].steam_id == ID) {
			return true;
		}
	}
	return false;
}
client.on('ready', () => {
	guild = client.guilds.find("id",process.env.SERVER_ID);
	admin = guild.roles.find("name", process.env.ADMIN_ROLE);
	channelReport = client.channels.find("name",channelName);
	
	reportDB.connect(function(err) {
		if (err) {
			channelReport.send("Couldn't connect to the database :(");
			process.exit(1);
		}
		SBconnected = true;
	});
	//refreshBlocked();
	console.log("Bot ready!");
});
/*
function refreshBlocked() {
	reportDB.query(`SELECT * FROM ${blockedDB}`, function(error, results, fields){
		if (!error) {
			blocked = results;
		}
	});
}*/

setInterval(function() {
	if(SBconnected) {
		reportDB.query(`SELECT * FROM ${reportsDB} WHERE sent = 0`, function (error, results, fields) {
		  if (error) throw error;
		  for (var i = results.length - 1; i >= 0; i--) {
		  	var SteamID = new SteamIDMaker(results[i].reporter_id);
		  	reportDB.query(`UPDATE ${reportsDB} SET sent = 1 WHERE id = ${results[i].id}`);
		  	if (!isBlocked(SteamID)) {
			  	var serverName = results[i].server_name;
			  	var ipPort = results[i].ip_port;
			  	var reporterName = results[i].reporter;
			  	var reporterID = results[i].reporter_id;
			  	var suspectName = results[i].suspect;
			  	var suspectID = results[i].suspect_id;
			  	var reason = results[i].reason;
			  	var dateOf = results[i].dateOf;
			  	if (suspectName != null) {
			  		channelReport.send(`**Nový Report!** ${admin}\n**Server**: ${serverName}\n**Připojit**: steam://connect/${ipPort}\n**Čas**: ${dateOf}\n**Nahlásil**: ${reporterName}\n**SteamID**: ${reporterID}\n**Hráč**: ${suspectName}\n**SteamID**: ${suspectID}\n**Důvod**: ${reason}`)
					 .then(function (message) {
                     message.react("👍")
                     message.react("✅")
					const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id != '529818637843038220'
					message.awaitReactions(filter)
					 .then(message.delete())
					 .catch(console.error);
					 });
			  	} else {
			  		channelReport.send(`**Nový Report!** ${admin}\n**Server**: ${serverName}\n**Připojit**: steam://connect/${ipPort}\n**Čas**: ${dateOf}\n**Nahlásil**: ${reporterName}\n**SteamID**: ${reporterID}\n**Důvod**: ${reason}`)
					 .then(function (message) {
                     message.react("👍")
                     message.react("✅")
					const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id != '529818637843038220'
					message.awaitReactions(filter)
					 .then(message.delete())
					 .catch(console.error);
					 });
			  	}
		  	}
		}
		});
	}

	client.on("messageReactionAdd", (messageReaction, user) => {

	if(message.content.includes(thisWord))
	{
		bot.sendMessage({
			to: channelID,
        message: "Your reply."
		})
	}

	});
}, 5000);

/*
client.on('message', message => {
	var user = message.author;
	if (message.channel == channelReport && isAdmin(user)) {
		if(message.content.startsWith(commandStr + "block")) {
			var SteamID = message.content.split(' ')[2];
			var error = false;
			try {
				SteamID = new SteamIDMaker(SteamID);
				SteamID.getSteam2RenderedID();
			} catch(err) {
				error = true;
				channelReport.send("SteamID wrong format!");
			}
			if (!error) {
				reportDB.query(`INSERT INTO ${blockedDB} (steam_id) VALUES ("${SteamID.getSteamID64()}")`, function(error, output, fields){
					if (!error) {
						var url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${SteamAPIKey}&steamids=${SteamID.getSteamID64()}`;
						request({
								url: url,
								json: true
							}, function (error, response, body) {
							if(error) {
								logError(error,true);
							} else {
								channelReport.send(`Successfully blocked ${body.response.players[0].personaname} from sending reports!`);
							}
						});
					} else {
						var url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${SteamAPIKey}&steamids=${SteamID.getSteamID64()}`;
						request({
								url: url,
								json: true
							}, function (error, response, body) {
							if(error) {
								logError(error,true);
							} else {
								channelReport.send(`${body.response.players[0].personaname} is already blocked!`);
							}
						});
					}
				});
			}
			refreshBlocked();
		}
		else if (message.content.startsWith(commandStr+"unblock")){
			var SteamID = message.content.split(' ')[2];
			var error = false;
			try {
				SteamID = new SteamIDMaker(SteamID);
				SteamID.getSteam2RenderedID();
			} catch(err) {
				error = true;
				channelReport.send("SteamID wrong format!");
			}
			if (!error) {
				reportDB.query(`DELETE FROM vc_blocked WHERE steam_id = "${SteamID.getSteamID64()}"`, function(error, output, fields) {
					if (!error) {
						var url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${SteamAPIKey}&steamids=${SteamID.getSteamID64()}`;
						request({
								url: url,
								json: true
							}, function (error, response, body) {
							if(error) {
								logError(error,true);
							} else {
								channelReport.send(`Successfully unblocked ${body.response.players[0].personaname} from sending reports!`);
							}
						});
					} else {
						var url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${SteamAPIKey}&steamids=${SteamID.getSteamID64()}`;
						request({
								url: url,
								json: true
							}, function (error, response, body) {
							if(error) {
								logError(error,true);
							} else {
								channelReport.send(`${body.response.players[0].personaname} isn't blocked!`);
							}
						});
					}
				});
			}
		}
		refreshBlocked();
	} 
});
*/

var filterInt = function(value) {
  if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
    return Number(value);
  return null;
}


client.login(process.env.BOT_TOKEN);
