const discord = module.require("discord.js");
const fetch = require("node-fetch");
const roblox = require("noblox.js");

const group_id = parseInt(process.env.GROUP_ID);
const discord_link = process.env.INVITE_LINK;

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
  let mention = message.mentions.members.first();
  
  if (!message.member.hasPermission(['MANAGE_NICKNAMES', 'CHANGE_NICKNAME ']) || !mention) {
    mention = message.member;
  }
  
  const discordId = message.author.id;
  const discordUsername = `<@${discordId}>`;
  let discordData = client.GetUserFromDiscordId.get(mention.id);
  if (discordData) {
    // User has verified
    const roblox_id = discordData.roblox_id;
    roblox.getUsernameFromId(roblox_id).then(async function(username){
      roblox.getRankNameInGroup(group_id, roblox_id).then(async function(name) {
        const discordRole = message.guild.roles.cache.find(x => x.name === name);
        const verifiedRole = message.guild.roles.cache.find(x => x.name === "Verified");
        console.log("xd");
        if (discordRole && verifiedRole) {
          console.log("Lol");
          await mention.roles.remove(discordRole);
          mention.roles.add([discordRole, verifiedRole]).catch(function() {});
          mention.setNickname(username).catch(function() {});;
          
          let points = discordData.points;
          const recommendations = (discordData.medals.match(/0/g) || []).length;
          
          try {
            roblox.getRankInGroup(group_id, discordData.roblox_id).then(async function(userRank) {
              if (userRank > 0 && userRank < highest_rank) {
                for (var rank = 13; rank >= 1; rank--) {
                  const rankInfo = rankup_system[rank];
                  const rankPoints = rankInfo.points;
                  const rankRecommendations = rankInfo.recommendations;
                  if (rankPoints >= 0 && points >= rankPoints && recommendations >= rankRecommendations) {
                    if (userRank != rank) {
                      roblox.setRank(group_id, discordData.roblox_id, rank).then(async function(newRole) {
                        const roleName = newRole.name;
                        console.log(`Promoted ${mention.user.tag} to ${roleName}`);
                        const discordRole = message.guild.roles.cache.find(x => x.name === roleName);

                        if (discordRole) {
                          const lastRole = mention.roles.cache.find(role => role.name.includes("|"));

                          if (lastRole) {
                            mention.roles.remove(lastRole).catch(function() {});
                          }

                          mention.roles.add(discordRole).catch(function() {});
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
          
          const embed = {
            title: "**Update**",
            description: `**${discordUsername}**, you have updated the user **[${username}](https://www.roblox.com/users/${roblox_id}/profile)**'s Nickname and Roles.'`,
            color: 7551404,
            footer: {
              icon_url:
                "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
              text: `Invite: ${discord_link}`
            },
            thumbnail: {
              url: `https://www.roblox.com/headshot-thumbnail/image?userId=${roblox_id}&width=420&height=420&format=png`
            }
          };
          message.channel.send({ embed }).then(async function(message) {
              message.delete({ timeout: 300000 }).catch(function() {});
          });
        }
      });
    });
  }
  else
    {
      // User hasn't been verified
      const embed = {
        title: "**Update**",
        description: `**${discordUsername}**, that user has not linked their Roblox and Discord accounts.`,
        color: 7551404,
        footer: {
          icon_url:
          "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
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
    name: "update",
    description: "Updates a discord user's roles and username.",
    usage: "update [tag]"
}