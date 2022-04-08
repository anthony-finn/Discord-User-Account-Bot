const discord = module.require("discord.js");

const group_id = parseInt(process.env.GROUP_ID);
const discord_link = process.env.INVITE_LINK;

module.exports.run = async function(client, message, args) {
  let mention = message.mentions.members.first();
  
  if (!message.member.hasPermission(['MANAGE_NICKNAMES', 'CHANGE_NICKNAME ']) || !mention) {
    mention = message.member;
  }
  
  const discordId = message.author.id;
  const discordUsername = `<@${discordId}>`;
  let discordData = client.GetUserFromDiscordId.get(mention.id);
  
  if (discordData) {
    const nonVerifiedRole = mention.guild.roles.cache.find(x => x.name === "Unverified");
    if (nonVerifiedRole) {
      client.RemoveUserByDiscordId.run(mention.id);
      mention.roles.remove(mention.roles.cache);
      
      mention.roles.add(nonVerifiedRole);
      mention.setNickname(mention.user.username);

      const embed = {
        title: "**Verification**",
        description: `**${discordUsername}**, you have unverified discord user <@${mention.id}>.'`,
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

    }
}

module.exports.help = {
    name: "unverify",
    description: "Unverifies a Roblox and Discord account. All data will be deleted.",
    usage: "unverify [tag]"
}