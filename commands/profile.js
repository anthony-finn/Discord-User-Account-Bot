const discord = module.require("discord.js");
const fetch = require("node-fetch");
const roblox = require('noblox.js')

const group_id = parseInt(process.env.GROUP_ID);
const discord_link = process.env.INVITE_LINK;

module.exports.run = async function(client, message, args) {
  const discordId = message.author.id;
  const discordUsername = `<@${discordId}>`;
  
  // Determine if they mentioned a user or Roblox username.
  let mention = message.mentions.users.first() || args[0] || message.author;
  if (typeof mention === "string") {
    // Mentioned a Roblox username
    const {Username, Id} = await fetch(`https://api.roblox.com/users/get-by-username?username=${mention}`).then(response => response.json());
    
    if (Username && Id) {
      let discordData = client.GetUserFromRobloxId.get(Id);
      if (discordData) {
        const user = client.users.fetch(discordData.discord_id)
        await user.then(function(result) {
          mention = result;
        })
      }
      else
        {
          mention = "that roblox user has not linked their Roblox and Discord accounts."
        }
    }
    else
      {
        mention = null;
      }
  }
  
  if (!mention) {
    // Invalid mention
        const embed = {
          "title": "**Profiles**",
          "description": `**${discordUsername}**, invalid username. That username does not exist.`,
          "color": 7551404,
          "footer": {
            "icon_url": "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
            "text": `Invite: ${discord_link}`
          },
          "thumbnail": {
           "url": "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png"
          }
        };
        message.channel.send({ embed });
  }
  else
    {
      // Mentioned a user or Roblox username.
      if (typeof mention === "object") {
        // Mention
        const discordId = mention.id;
        let discordData = client.GetUserFromDiscordId.get(discordId);
        
        // Determine if user has Verified
        if (discordData) {
          const id = discordData.roblox_id;
          const {Username} = await fetch(`https://api.roblox.com/users/${id}`).then(response => response.json());
          const past_usernames_html = await fetch(`https://www.roblox.com/users/${id}/profile`).then(response => response.text());
          const {description} = await fetch(`https://users.roblox.com/v1/users/${id}`).then(response => response.json());
          let past_usernames = null;
          if (past_usernames_html.indexOf("Roblox.ProfileHeaderData={\"") != -1) {
            const regex = new RegExp("Roblox.ProfileHeaderData={\"(.*)" + "\"}");
            past_usernames = past_usernames_html.match(regex);
            if (past_usernames) {
              past_usernames = JSON.parse("{\"" + past_usernames[1] + "\"}");
              if (past_usernames) {
                past_usernames = past_usernames.previoususernames;
                if (past_usernames) {
                  past_usernames = past_usernames.split(/\r?\n/);
                }
              }
            }
          }
          const sorted_past_usernames = [];
          for(var i = past_usernames.length - 1; i >= 0; i--) {
            const username = past_usernames[i];
            if (username && i <= 5) {
              sorted_past_usernames.push(username);
            }
          }
          const usernamesString = sorted_past_usernames.length > 0 ? sorted_past_usernames.join(', ') : "No past usernames.";
          
          roblox.getRankNameInGroup(group_id, id).then(function(name) {
            const embed = {
              "description": `**[View Profile](https://www.roblox.com/users/${id}/profile)** \`${name}\``,
              "url": `https://www.roblox.com/users/${id}/profile`,
              "color": 7551404,
              "footer": {
                "icon_url": "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
                "text": `Invite: ${discord_link}`
              },
              "thumbnail": {
                "url": `https://www.roblox.com/headshot-thumbnail/image?userId=${id}&width=420&height=420&format=png`
              },
              "author": {
                "name": `${Username}`,
                "icon_url": `https://www.roblox.com/headshot-thumbnail/image?userId=${id}&width=420&height=420&format=png`
              },
              "fields": [
                {
                  "name": "About",
                  "value": description || "No description found."
                },
                {
                  "name": "Past Usernames",
                  "value": usernamesString
                },
                {
                  "name": "Discord",
                  "value": `<@${discordId}>`,
                  "inline": true
                },
                {
                  "name": "Crystals",
                  "value": discordData.points,
                  "inline": true
                },
                {
                  "name": "Medals",
                  "value": discordData.medals.length,
                  "inline": true
                }
              ]
            };
            message.channel.send({ embed: embed });
          });
        }
        else
          {
            // Unverified
            const embed = {
              "title": "**Profiles**",
              "description": `**${discordUsername}**, that user has not yet verified their Roblox and Discord accounts.`,
              "color": 7551404,
              "footer": {
                "icon_url": "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
                "text": `Invite: ${discord_link}`
              },
              "thumbnail": {
               "url": "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png"
              }
            };
            message.channel.send({ embed });
          }
      }
      else if(typeof mention === "string") {
        // Invalid
        const embed = {
          "title": "**Profiles**",
          "description": `**${discordUsername}**, ${mention}`,
          "color": 7551404,
          "footer": {
            "icon_url": "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png",
            "text": `Invite: ${discord_link}`
          },
          "thumbnail": {
           "url": "https://cdn.discordapp.com/attachments/707667215163457587/708153163617927168/nocturne.png"
          }
        };
        message.channel.send({ embed });
      }
    }
  
}

module.exports.help = {
    name: "profile",
    description: "Views the profile of a group member.",
    usage: "profile [tag/username]"
}