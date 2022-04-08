const discord = module.require("discord.js");
const fetch = require("node-fetch");
const roblox = require("noblox.js");

const group_id = parseInt(process.env.GROUP_ID);
const discord_link = process.env.INVITE_LINK;
const min_rank = parseInt(process.env.MIN_RANK);

module.exports.run = async function(client, message, args) {
	const discordId = message.author.id;
	const discordUsername = `<@${discordId}>`;
	let discordData = client.GetUserFromDiscordId.get(discordId);
	const shout = args[0] && args.join(' ') || null;
	var embed = null;
	
	if (discordData) {
		await roblox.getRankInGroup(group_id, discordData.roblox_id).then(async function(rank) {
			if (rank >= min_rank) {
				const role = message.guild.roles.cache.find(x => x.name === "Verified");
				if (role) {
					if (shout) {
						
						embed = {
						  "title": "Group Shout",
						  "description": shout,
						  "color": 7551404,
						  "footer": {
							"icon_url": "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
							"text": `Invite: ${discord_link} | Type \'!notify\' in Nocturne to toggle these notifications.`
						  },
						  "author": {
							"name": "Nocturne",
							"url": "https://www.roblox.com/groups/1004235/Nocturne",
							"icon_url": "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png"
						  }
						};
						
            
						message.guild.members.fetch().then(async function(members) {
              members.map(async function(member) {
							  const state = member.user.presence.status;
                if (state == "dnd" || state == "online") {
                  if (!member.roles.cache.find(x => x.name === "Ignore")) {
                    member.user.send({ embed }).catch(function(err) {});
                  }
                }
              })
						}).catch(function() {});
					}
				}
			}
			else
			{
				// Too low rank
				embed = {
					title: "**:x: Error**",
					description: `**${discordUsername}**, your rank is too low to use this command.`,
					color: 7551404,
					footer: {
						icon_url: "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
						text: `Invite: ${discord_link} | Type "!notify" in Nocturne to disable these messages."`
					},
					thumbnail: {
						url: "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png"
					}
				};
				message.channel.send({ embed }).then(async function(message) {
					message.delete({ timeout: 300000 }).catch(function() {});
				});
			}
		});
	}
	else
	{
		// Not verified
		embed = {
			title: "**:x: Error**",
			description: `**${discordUsername}**, you must verify your Roblox account in order to use this command.`,
			color: 7551404,
			footer: {
				icon_url: "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
				text: `Invite: ${discord_link}`
			},
			thumbnail: {
				url: "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png"
			}
		};
		message.channel.send({ embed }).then(async function(message) {
			message.delete({ timeout: 300000 }).catch(function() {});
		});
	}
}

module.exports.help = {
    name: "shout",
    description: "Shouts a message to verified and online members.",
    usage: "shout [message]"
}