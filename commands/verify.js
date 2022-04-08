const discord = module.require("discord.js");
const fetch = require("node-fetch");
const roblox = require("noblox.js");
const randomWords = require("random-words");

const group_id = parseInt(process.env.GROUP_ID);
const rankup_rank = parseInt(process.env.RANKUP);
const discord_link = process.env.INVITE_LINK;

module.exports.run = async function(client, message, args) {
  const member = message.member;
  const discordId = message.author.id;
  const discordUsername = `<@${discordId}>`;
  let discordData = client.GetUserFromDiscordId.get(discordId);
  message.delete({ timeout: 300000 }).catch(function() {});
  if (!discordData) {
    // Data does not already exist for this Discord user.
    // Ask user for their Roblox Username. https://api.roblox.com/users/get-by-username?username=
    let embed = {
      title: "**Verification**",
      description: `**${discordUsername},** please type your Roblox **username**.`,
      color: 7551404,
      footer: {
        icon_url:
          "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
        text: "Expires in 5 minutes."
      },
      thumbnail: {
        url: message.author.avatarURL()
      }
    };
    message.channel.send({ embed }).then(async function(message) {
      // Await response from user by creating a collector.
      let collector = message.channel.createMessageCollector(message => message.author.id === discordId, { time: 300000 });
      var username;
      var id;
      
      collector.on("collect", async function(message) {
        message.delete({ timeout: 300000 }).catch(function() {});
        const { Username, Id } = await fetch(`https://api.roblox.com/users/get-by-username?username=${message.content}`).then(response => response.json());
        username = Username;
        id = Id;
        collector.stop("Input");
      });
      
      // Response either timed out or user inputted a username.
      collector.on("end", async function(collected, reason) {
        if (reason && reason === "Input") {
          message.delete({ timeout: 300000 }).catch(function() {});

          // User inputted a username.
          if (username && id) {
            // Is the username valid
            // Generate random key
            roblox.getRankInGroup(group_id, id).then(function(rank) {
              if (rank > 0) {
                const key = randomWords({ exactly: 7, join: " " });
                embed = {
                  title: "**Verification**",
                  description: `**${discordUsername}**, navigate to your [account settings](https://www.roblox.com/my/account) or to your [profile](https://www.roblox.com/users/${id}/profile). Then, paste the following code in your **status or about** section. Once completed, add a reaction to this message.\n\`\`\`${key}\`\`\``,
                  color: 7551404,
                  footer: {
                    icon_url:
                      "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
                    text: "Expires in 5 minutes."
                  },
                  thumbnail: {
                    url: `https://www.roblox.com/headshot-thumbnail/image?userId=${id}&width=420&height=420&format=png`
                  },
                  image: {
                    url:
                      "https://cdn.discordapp.com/attachments/707680999479312447/708159249729060904/VerificationTutorial.png"
                  },
                  fields: [
                    {
                      name: "Instructions",
                      value:
                        "The image below describes the step-by-step process to add the text to the **about** section of your profile."
                    }
                  ]
                };
                // Give random key to user and promp them to react to the message.
                message.channel.send({ embed }).then(async function(message) {
                  message.react("708155601808654346");
                  // Await reaction from user
                  message.awaitReactions((reaction, user) => user.id == discordId && reaction.emoji.name == "Nocturne", { max: 1, time: 300000 }).then(async function(collected) {
                      if (collected.first().emoji.name == "Nocturne") {
                        message.delete({ timeout: 300000 }).catch(function() {});
                        // Validify if key is found.
                        const html = await fetch(`https://www.roblox.com/users/${id}/profile`).then(response => response.text());
                        
                        if (html.indexOf(key) != -1) {
                          // Key found
                          discordData = client.SetUser.run({discord_id: discordId, roblox_id: id, points: 0, medals: ""});
                          embed = {
                            title: "**Verification**",
                            description: `**${discordUsername}** has verified the Roblox account **[${username}](https://www.roblox.com/users/${id}/profile)**.`,
                            color: 7551404,
                            footer: {
                              icon_url:
                                "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
                              text: `Invite: ${discord_link}`
                            },
                            thumbnail: {
                              url: `https://www.roblox.com/headshot-thumbnail/image?userId=${id}&width=420&height=420&format=png`
                            }
                          };
                          message.channel.send({ embed });

                          // Rankup
                          if (rank == 1) {
                            // Needs a promotion
                            roblox.setRank(group_id, id, rankup_rank).then(async function(roles) {
                                const roleName = roles.name;
                                const discordRole = message.guild.roles.cache.find(x => x.name === roleName);
                                const verifiedRole = message.guild.roles.cache.find(x => x.name === "Verified");

                                if (discordRole && verifiedRole) {
                                  await member.roles.set([]).catch(console.log);
                                  member.roles.add([discordRole, verifiedRole]).catch(function() {});;
                                  member.setNickname(username).catch(function() {});;
                                }
                              });
                          } else {
                            // Rank too high.
                            roblox.getRankNameInGroup(group_id, id).then(async function(name) {
                                const discordRole = message.guild.roles.cache.find(x => x.name === name);
                                const verifiedRole = message.guild.roles.cache.find(x => x.name === "Verified");

                                if (discordRole && verifiedRole) {
                                  await member.roles.set([]).catch(function() {});
                                  member.roles.add([discordRole, verifiedRole]).catch(function() {});;
                                  member.setNickname(username).catch(function() {});;
                                }
                              });
                          }
                        } else {
                          // Key was not found
                          embed = {
                            title: "**Verification**",
                            description: `**${discordUsername}**, the key was not found on the **about or status** of that profile. The verification process has been cancelled.`,
                            color: 7551404,
                            footer: {
                              icon_url:
                                "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
                              text: `Invite: ${discord_link}`
                            },
                            thumbnail: {
                              url:
                                "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png"
                            }
                          };
                          message.channel.send({ embed }).then(async function(message) {
                            message.delete({ timeout: 300000 }).catch(function() {});
                          });
                        }
                      }
                    })
                    .catch(() => {
                      // No reaction after 5 minutes.
                      message.delete().catch(function() {});
                    });
                });
              } else {
                embed = {
                  title: "**Verification**",
                  description: `**${discordUsername}**, please join **[Nocturne](https://www.roblox.com/groups/1004235)** and wait until you are accepted.`,
                  color: 7551404,
                  footer: {
                    icon_url:
                      "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
                    text: `Invite: ${discord_link}`
                  },
                  thumbnail: {
                    url:
                      "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png"
                  }
                };
                message.channel.send({ embed }).then(async function(message) {
                  message.delete({ timeout: 300000 }).catch(function() {});
                });
              }
            });
          } else {
            // Invalid username.
            embed = {
              title: "**Verification**",
              description: `**${discordUsername}**, you have inputted an invalid username. The verification process has been cancelled.`,
              color: 7551404,
              footer: {
                icon_url:
                  "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
                text: `Invite: ${discord_link}`
              },
              thumbnail: {
                url:
                  "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png"
              }
            };
            message.channel.send({ embed }).then(async function(message) {
              message.delete({ timeout: 300000 }).catch(function() {});
            });
          }
        } else {
          // Timed out.
          message.delete().catch(function() {});
        }
      });
    });
  } else {
    // User has already linked their Discord and Roblox account.
    const id = discordData.roblox_id;
    const { Username } = await fetch(`https://api.roblox.com/users/${id}`).then(response => response.json());
    const embed = {
      title: "**Verification**",
      description: `**${discordUsername}**, you have already connected your Discord and Roblox accounts. You have verified the roblox user **[${Username}](https://www.roblox.com/users/${id}/profile)**.`,
      color: 7551404,
      footer: {
        icon_url:
          "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
        text: `Invite: ${discord_link}`
      },
      thumbnail: {
        url: `https://www.roblox.com/headshot-thumbnail/image?userId=${id}&width=420&height=420&format=png`
      }
    };
    message.channel.send({ embed }).then(async function(message) {
        message.delete({ timeout: 300000 }).catch(function() {});
    });
  }
};

module.exports.help = {
  name: "verify",
  description: "Verifies a Roblox account.",
  usage: "verify"
};
