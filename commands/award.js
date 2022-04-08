const discord = module.require("discord.js");
const fetch = require("node-fetch");
const roblox = require("noblox.js");

const group_id = parseInt(process.env.GROUP_ID);
const discord_link = process.env.INVITE_LINK;
const min_rank = parseInt(process.env.MIN_RANK);
const highest_rank = parseInt(process.env.HIGHEST_RANK);

const rankup_system = {
  13: {points: 300, recommendations: 12},
  12: {points: 250, recommendations: 7},
  11: {points: 175, recommendations: 4},
  10: {points: 150, recommendations: 2},
  9: {points: 125, recommendations: 1},
  8: {points: 85, recommendations: 0},
  7: {points: 50, recommendations: 0},
  6: {points: 32, recommendations: 0},
  5: {points: 24, recommendations: 0},
  4: {points: 16, recommendations: 0},
  3: {points: 8, recommendations: 0},
	2: {points: 0, recommendations: 0},
  1: {points: -1, recommendations: 0}
}

module.exports.run = async function(client, message, args) {
	const discordId = message.author.id;
	const discordUsername = `<@${discordId}>`;
	let discordData = client.GetUserFromDiscordId.get(discordId);
	let success = [];
	var embed = null;
	
	if (discordData) {
		await roblox.getRankInGroup(group_id, discordData.roblox_id).then(async function(rank) {
			if (rank >= min_rank) {
				if (args[0].toLowerCase() === "crystal" || args[0].toLowerCase() === "crystals") {
					var amount = Math.floor(Number(args[1]));
					if (amount !== Infinity && String(amount) === args[1]) {
						const mentions = message.mentions;
						
						if (mentions.members.array().length > 0) {
							mentions.members.forEach(async function(guildMember, guildMemberId) {
								let memberDiscordData = client.GetUserFromDiscordId.get(guildMemberId);
								
                if (memberDiscordData) {
                  let points = memberDiscordData.points;
                  const recommendations = (memberDiscordData.medals.match(/0/g) || []).length;
                  
                  memberDiscordData = {discord_id: memberDiscordData.discord_id, roblox_id: memberDiscordData.roblox_id, points: points + amount, medals: memberDiscordData.medals};
                  client.SetUser.run(memberDiscordData);
                  success.push(`<@${memberDiscordData.discord_id}>`);
                  
                  points = memberDiscordData.points;
                  
                  try {
                    roblox.getRankInGroup(group_id, memberDiscordData.roblox_id).then(async function(userRank) {
                      if (userRank > 0 && userRank < highest_rank) {
                        for (var rank = 13; rank >= 1; rank--) {
                          const rankInfo = rankup_system[rank];
                          const rankPoints = rankInfo.points;
                          const rankRecommendations = rankInfo.recommendations;
                          if (rankPoints >= 0 && points >= rankPoints && recommendations >= rankRecommendations) {
                            if (userRank != rank) {
                              roblox.setRank(group_id, memberDiscordData.roblox_id, rank).then(async function(newRole) {
                                const roleName = newRole.name;
                                console.log(`Promoted ${guildMember.user.tag} to ${roleName}`);
                                const discordRole = message.guild.roles.cache.find(x => x.name === roleName);

                                if (discordRole) {
                                  const lastRole = guildMember.roles.cache.find(role => role.name.includes("|"));

                                  if (lastRole) {
                                    guildMember.roles.remove(lastRole).catch(function() {});
                                  }

                                  guildMember.roles.add(discordRole).catch(function() {});
                                }
                              });
                            }

                            break;
                          }
                        }
                      }
                    });
                  }
                  catch(err) {}
                }
							});
							
							embed = {
								author: {
									name: `Awarded crystals`,
									icon_url: `${message.author.avatarURL()}`
								},
								description: `**${discordUsername}**, Awarded ${amount} crystals to ${success.toString()}.`,
								color: 7551404,
								footer: {
									icon_url: "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
									text: `Invite: ${discord_link}`
								},
								thumbnail: {
									url: "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png"
								}
							};
							message.channel.send({ embed });
						}
						else
						{
							// Invalid mentions
							embed = {
								title: "**:x: Error**",
								description: `**${discordUsername}**, you didn't mention any user.`,
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
					else
					{
						// Invalid amount
						embed = {
							title: "**:x: Error**",
							description: `**${discordUsername}**, you have inputted an invalid amount.`,
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
				else if(args[0].toLowerCase() === "fav" || args[0].toLowerCase() === "favor" || args[0].toLowerCase() === "rec" || args[0].toLowerCase() === "recommendation"){
					var amount = Math.floor(Number(args[1]));
					if (amount !== Infinity && String(amount) === args[1]) {
						const mentions = message.mentions;
						
						if (mentions.members.array().length > 0) {
							mentions.members.forEach(async function(guildMember, guildMemberId) {
								let memberDiscordData = client.GetUserFromDiscordId.get(guildMemberId);
								
                if (memberDiscordData) {
                  let points = memberDiscordData.points;
                  const recommendations = ((memberDiscordData.medals.match(/0/g) || []).length) + amount;
                  let medals = amount >= 0 ? memberDiscordData.medals + "0".repeat(amount) : memberDiscordData.medals
                  if (amount < 0) {
                    for (var i = 1; i <= Math.abs(amount); i++) {
                      let idx = medals.indexOf("0");
                      if (idx != -1) {
                        medals = medals.slice(0, idx) + medals.slice(idx + 1);
                      }
                    }
                  }
                  memberDiscordData = {discord_id: memberDiscordData.discord_id, roblox_id: memberDiscordData.roblox_id, points: points, medals: medals};
                  client.SetUser.run(memberDiscordData);
                  success.push(`<@${memberDiscordData.discord_id}>`);
                  
                  points = memberDiscordData.points;
                  
                  try {
                    roblox.getRankInGroup(group_id, memberDiscordData.roblox_id).then(async function(userRank) {
                      if (userRank > 0 && userRank < highest_rank) {
                        for (var rank = 13; rank >= 1; rank--) {
                          const rankInfo = rankup_system[rank];
                          const rankPoints = rankInfo.points;
                          const rankRecommendations = rankInfo.recommendations;
                          if (rankPoints >= 0 && points >= rankPoints && recommendations >= rankRecommendations) {
                            if (userRank != rank) {
                              roblox.setRank(group_id, memberDiscordData.roblox_id, rank).then(async function(newRole) {
                                const roleName = newRole.name;
                                console.log(`Promoted ${guildMember.user.tag} to ${roleName}`);
                                const discordRole = message.guild.roles.cache.find(x => x.name === roleName);

                                if (discordRole) {
                                  const lastRole = guildMember.roles.cache.find(role => role.name.includes("|"));

                                  if (lastRole) {
                                    guildMember.roles.remove(lastRole).catch(function() {});
                                  }

                                  guildMember.roles.add(discordRole).catch(function() {});
                                }
                              });
                            }

                            break;
                          }
                        }
                      }
                    });
                  }
                  catch(err) {}
                }
							});
							
							embed = {
								author: {
									name: `Awarded favor`,
									icon_url: `${message.author.avatarURL()}`
								},
								description: `**${discordUsername}**, Awarded ${amount} favor to ${success.toString()}.`,
								color: 7551404,
								footer: {
									icon_url: "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
									text: `Invite: ${discord_link}`
								},
								thumbnail: {
									url: "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png"
								}
							};
							message.channel.send({ embed });
						}
						else
						{
							// Invalid mentions
							embed = {
								title: "**:x: Error**",
								description: `**${discordUsername}**, you didn't mention any user.`,
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
					else
					{
						// Invalid amount
						embed = {
							title: "**:x: Error**",
							description: `**${discordUsername}**, you have inputted an invalid amount.`,
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
        else
				{	
					// Invalid award type
					embed = {
						title: "**:x: Error**",
						description: `**${discordUsername}**, you have inputted an invalid award type.`,
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
			else
			{
				// Too low rank
				embed = {
					title: "**:x: Error**",
					description: `**${discordUsername}**, your rank is too low to use this command.`,
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
    name: "award",
    description: "Award a roblox user a crystals or medals.",
    usage: "award [type] [ammount] [mentions]"
}