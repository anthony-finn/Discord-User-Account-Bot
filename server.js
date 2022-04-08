// Libraries

const discord = require("discord.js");
const client = new discord.Client();
const express = require("express");
const http = require('http');
const app = express();
const fetch = require("node-fetch");
const sqlite = require("better-sqlite3");
const sql = new sqlite("data/data.sqlite");
const roblox = require("noblox.js");
const bodyParser = require("body-parser");

// Configs

const discord_token = process.env.TOKEN;
const prefix = process.env.PREFIX;
const port = process.env.PORT;
const cookie = process.env.COOKIE;
const group_id = parseInt(process.env.GROUP_ID);
const min_rank = parseInt(process.env.MIN_RANK);
const highest_rank = parseInt(process.env.HIGHEST_RANK);

const rankup_system = {
	1: {points: -1, recommendations: 0},
	2: {points: 0, recommendations: 0},
	3: {points: 8, recommendations: 0},
	4: {points: 16, recommendations: 0},
	5: {points: 24, recommendations: 0},
	6: {points: 32, recommendations: 0},
	7: {points: 50, recommendations: 0},
	8: {points: 85, recommendations: 0},
	9: {points: 125, recommendations: 1},
	10: {points: 150, recommendations: 2},
	11: {points: 175, recommendations: 4},
	12: {points: 250, recommendations: 7},
	13: {points: 300, recommendations: 12}
}

// Modules

const utility = require("./utility/functions.js");

// Express Initialization

app.set("env", "production");
app.use(bodyParser.json()); // Helpful for parsing the body into JSON
app.use(utility.Authenticate); // Authenticate all requests for the correct auth_key

// Main

client.on("ready", function() {
  console.log(`Logged into ${client.user.tag}`);
  PrepareQueue();
});

app.get("/", (request, response) => {
  response.sendStatus(200);
});

setInterval(() => function() {
  roblox.refreshCookie();
  http.get(`https://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 240000);

client.on("message", function(message) {
  if (message.author.bot) return;
  if (message.content.indexOf(prefix) !== 0) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  try {
    let commandFile = require(`./commands/${command}.js`);
    commandFile.run(client, message, args);
  } catch (err) {
    // console.log(err);
  }
});

client.on("voiceStateUpdate", async function(oldState, newState) {
  const textChannel = newState.member.guild.channels.cache.get('727335113511403550');

  if ((newState.channelID === '720026346927030273' || newState.channelID === '721137913210994728') && oldState.channelID !== '720026346927030273' && oldState.channelID !== '721137913210994728') {
    const embed = {
      "timestamp": Date.now(),
      "footer": {
        "icon_url": "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
        "text": "Nocturne"
      },
      "author": {
        "name": `Has Joined ${newState.channel.name}`,
        "icon_url": newState.member.user.avatarURL()
      },
      "fields": [
        {
          "name": "User",
          "value": newState.member
        }
      ]
    };
    
    textChannel.send({ embed });
  }
  else if ((oldState.channelID === '720026346927030273' && newState.channelID !== '720026346927030273') || (oldState.channelID === '721137913210994728' && newState.channelID !== '721137913210994728')) {
    const embed = {
      "timestamp": Date.now(),
      "footer": {
        "icon_url": "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
        "text": "Nocturne"
      },
      "author": {
        "name": `Has Left ${oldState.channel.name}`,
        "icon_url": newState.member.user.avatarURL()
      },
      "fields": [
        {
          "name": "User",
          "value": newState.member
        }
      ]
    };
    
    textChannel.send({ embed });
  }
});

client.on('guildMemberAdd', async function(member) {
  const discordId = member.id;
  let discordData = client.GetUserFromDiscordId.get(discordId);
  
  if (discordData) {
    // The user has already verified.
    const id = discordData.roblox_id;
    roblox.getRankNameInGroup(group_id, id).then(function(name) {
      const discordRole = member.guild.roles.cache.find(x => x.name === name);
      const verifiedRole = member.guild.roles.cache.find(x => x.name === "Verified");
      const communityRole = member.guild.roles.cache.find(x => x.name == "⁣      ○| Community |○      ⁣");
      const gamesRole = member.guild.roles.cache.find(x => x.name == "⁣        ○| Games |○        ⁣");
      const socialRole = member.guild.roles.cache.find(x => x.name == "⁣         ○| Social |○        ⁣");
      const specialRole = member.guild.roles.cache.find(x => x.name == "⁣        ○| Special |○        ⁣");
      if (discordRole && verifiedRole) {
        member.roles.add([discordRole, verifiedRole, communityRole, gamesRole, socialRole, specialRole]);
      }
    });
  }
  else
    {
      const nonVerifiedRole = member.guild.roles.cache.find(x => x.name === "Unverified");
      member.roles.add(nonVerifiedRole);
    }
  
  const channel = member.guild.channels.cache.find(x => x.name === "join-logs");
  if (channel) {
    let user = "**Unverified**";
    if (discordData) {
      const { Username } = await fetch(`https://api.roblox.com/users/${discordData.roblox_id}`).then(response => response.json());
      user = `**[${Username}](https://www.roblox.com/users/${discordData.roblox_id}/profile)**`;
    }
    const embed = {
      "description": "Joined the server.",
      "color": 7551404,
      "timestamp": Date.now(),
      "footer": {
        "icon_url": "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
        "text": "Nocturne"
      },
      "author": {
        "name": member.user.username,
        "icon_url": member.user.avatarURL()
      },
      "fields": [
        {
          "name": "Tag",
          "value": `<@${member.user.id}>`,
          "inline": true
        },
        {
          "name": "Verified",
          "value": user,
          "inline": true
        }
      ]
    };
    channel.send({ embed });
  }
});

client.on('guildMemberRemove', async function(member) {
  const discordId = member.id;
  let discordData = client.GetUserFromDiscordId.get(discordId);
  const channel = member.guild.channels.cache.find(x => x.name === "leave-logs");
  if (channel) {
    let user = "**Unverified**";

    if (discordData) {
      const { Username } = await fetch(`https://api.roblox.com/users/${discordData.roblox_id}`).then(response => response.json());
      user = `**[${Username}](https://www.roblox.com/users/${discordData.roblox_id}/profile)**`;
    }

    const embed = {
      "description": "Left the server.",
      "color": 7551404,
      "timestamp": Date.now(),
      "footer": {
        "icon_url": "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
        "text": "Nocturne"
      },
      "author": {
        "name": member.user.username,
        "icon_url": member.user.avatarURL()
      },
      "fields": [
        {
          "name": "Tag",
          "value": `<@${member.user.id}>`,
          "inline": true
        },
        {
          "name": "Verified",
          "value": user,
          "inline": true
        }
      ]
    };
    channel.send({ embed });
  }
});

function PrepareQueue() {
  client.queue = {
    voiceChannel: null,
    songs: [],
    connection: null,
    volume: 5,
    playing: null,
    skips: []
  };
}

function PrepareSQL() {
  const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'users';").get();
  if (!table['count(*)']) {
    sql.prepare("CREATE TABLE users (discord_id TEXT, roblox_id INTEGER, points INTEGER, medals TEXT, PRIMARY KEY (discord_id, roblox_id));").run();
    sql.prepare("CREATE UNIQUE INDEX idx_users_id ON users (discord_id, roblox_id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }

  client.GetUserFromDiscordId = sql.prepare("SELECT * FROM users WHERE discord_id = ?");
  client.GetUserFromRobloxId = sql.prepare("SELECT * FROM users WHERE roblox_id = ?");  
  client.SetUser = sql.prepare("INSERT OR REPLACE INTO users (discord_id, roblox_id, points, medals) VALUES (@discord_id, @roblox_id, @points, @medals);"); 
  client.RemoveUserByDiscordId = sql.prepare("DELETE FROM users WHERE discord_id = ?");
  client.RemoveUserByRobloxId = sql.prepare("DELETE FROM users WHERE roblox_id = ?");
}

// Validate all Promotions/Demotions
const { Promotions, SetRank, GetPlayers, SetPoints, JoinRequests, GroupShouts, Validate } = require('./utility/validator.js')

app.post("/Promote", Promotions(), Validate, utility.ChangeRank(1));
app.post("/Demote", Promotions(), Validate, utility.ChangeRank(-1));
app.post("/GetPlayers", GetPlayers(), Validate, async function(req, res, next) {
  const group = req.body.Group;
  let ret = [];
  
  await roblox.getRoles(group).then(async function(roles) {
    for (var i = 0; i < roles.length; i++) {
      const role = roles[i];
      await roblox.getPlayers(group, role.ID).then(function(players) {
        for (var i = 0; i < players.length; i++) {
          const player = players[i];
          let discordData = client.GetUserFromRobloxId.get(player.userId);
          let points = 0;
          let medals = "";
          if (discordData) {
            points = discordData.points;
            medals = discordData.medals;
          }  
          ret.push({userId: player.userId, username: player.username, role: role.name, rank: role.rank, points: points, medals: medals});
        }
      });     
    }
  });
  res.status(200).send({
    error: null,
    message: ret
  });
});

app.post("/SetPoints", SetPoints(), Validate, async function(req, res, next) {
  const guild = client.guilds.cache.get('707377266773983272');
  const targets = req.body.Targets;
  const amount = req.body.Amount;
  let errors = [];
  let success = [];
  for (let key in targets) {
    const roblox_id = targets[key];
    let discordData = client.GetUserFromRobloxId.get(roblox_id);
    
    if (discordData) {
      const guildMember = guild.members.cache.get(discordData.discord_id);
      discordData = {discord_id: discordData.discord_id, roblox_id: discordData.roblox_id, points: amount, medals: discordData.medals};
      client.SetUser.run(discordData);
      success.push(roblox_id);
      
			await roblox.getRankInGroup(group_id, discordData.roblox_id).then(async function(userRank) {
				if (userRank > 0 && userRank < highest_rank) {
					var medalLen = discordData.medals.length;
					let recommendations = 0;
					while (medalLen--) {
						const medal = discordData.medals.charAt(medalLen);
						if (medal === "0") {
							recommendations = recommendations + 1;
						}
					}
											
					for (var i = 13; i >= 1; i--) {
						const rankInfo = rankup_system[i];
												
						if (rankInfo.points >= 0 && discordData.points >= rankInfo.points && recommendations >= rankInfo.recommendations) {
              if (userRank != i) {
                await roblox.getRankNameInGroup(group_id, discordData.roblox_id).then(async function(name) {
                  const previousRole = guild.roles.cache.find(x => x.name === name);
                  if (previousRole) {
                    await guildMember.roles.remove(previousRole).catch(function() {});
                  }

                  await roblox.setRank(group_id, discordData.roblox_id, i).then(async function(roles) {
                    const roleName = roles.name;
                    console.log(`Promoted ${guildMember.user.tag} to ${roleName}`);
                    const discordRole = guild.roles.cache.find(x => x.name === roleName);
                    
                    if (discordRole) {
                      guildMember.roles.add(discordRole).catch(function() {});
                    }
                  });
                });
              }
													
							break;
						}
					}
				}
			});
    }
    else
      {
        errors.push(roblox_id);
      }
  }
  res.status(200).send({
    error: null,
    message: "Success:" + success.join(",") + " Errors:" + errors.join(",")
  });
});
app.post("/AddPoints", SetPoints(), Validate, async	function(req, res, next) {
  const guild = client.guilds.cache.get('707377266773983272');
  const targets = req.body.Targets;
  const amount = req.body.Amount;
  let errors = [];
  let success = [];
  for (let key in targets) {
    const roblox_id = targets[key];
    let discordData = client.GetUserFromRobloxId.get(roblox_id);
    
    if (discordData) {
      const guildMember = guild.members.cache.get(discordData.discord_id);
      discordData = {discord_id: discordData.discord_id, roblox_id: discordData.roblox_id, points: discordData.points + amount, medals: discordData.medals};
      client.SetUser.run(discordData);
      success.push(roblox_id);
      
			await roblox.getRankInGroup(group_id, discordData.roblox_id).then(async function(userRank) {
				if (userRank > 0 && userRank < highest_rank) {
					var medalLen = discordData.medals.length;
					let recommendations = 0;
					while (medalLen--) {
						const medal = discordData.medals.charAt(medalLen);
						if (medal === "0") {
							recommendations = recommendations + 1;
						}
					}
											
					for (var i = 13; i >= 1; i--) {
						const rankInfo = rankup_system[i];
												
						if (rankInfo.points >= 0 && discordData.points >= rankInfo.points && recommendations >= rankInfo.recommendations) {
              if (userRank != i) {
                await roblox.getRankNameInGroup(group_id, discordData.roblox_id).then(async function(name) {
                  const previousRole = guild.roles.cache.find(x => x.name === name);
                  if (previousRole) {
                    await guildMember.roles.remove(previousRole).catch(function() {});
                  }

                  await roblox.setRank(group_id, discordData.roblox_id, i).then(async function(roles) {
                    const roleName = roles.name;
                    console.log(`Promoted ${guildMember.user.tag} to ${roleName}`);
                    const discordRole = guild.roles.cache.find(x => x.name === roleName);
                    
                    if (discordRole) {
                      guildMember.roles.add(discordRole).catch(function() {});
                    }
                  });
                });
              }
													
							break;
						}
					}
				}
			});
    }
    else
      {
        errors.push(roblox_id);
      }
  }
  res.status(200).send({
    error: null,
    message: "Success:" + success.join(",") + " Errors:" + errors.join(",")
  });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`Internal server error: ${err}`);
});

async function login() {
    await roblox.setCookie(cookie);
    return await roblox.getCurrentUser();
}

login()
    .then(current_user => {
        console.log(`Logged into ${current_user.UserName}`);
        app.listen(port, function () {
            console.log(`Listening at http://localhost:${port}`);
        });
    })
    .catch(err => {
        var errorApp = express()
        errorApp.get("/*", function (req, res, next) {
            res.json({ error: "Server configuration error: " + err });
        });
        errorApp.listen(port, function () {
            console.log("Error running server: " + err);
        });
    });

client.login(discord_token);
PrepareSQL();