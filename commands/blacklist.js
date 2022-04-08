const discord = module.require("discord.js");
const fetch = require("node-fetch");
const roblox = require("noblox.js");

const group_id = parseInt(process.env.GROUP_ID);
const discord_link = process.env.INVITE_LINK;
const min_rank = parseInt(process.env.MIN_RANK);

module.exports.run = async function(client, message, args) {
  const discordId = message.author.id;
  let discordData = client.GetUserFromDiscordId.get(discordId);
  
	if (discordData) {
		await roblox.getRankInGroup(group_id, discordData.roblox_id).then(async function(rank) {
			if (rank >= min_rank) {
        
      }
    });
  }
}

module.exports.help = {
    name: "blacklist",
    description: "Blacklists a user from all Nocturne events/places.",
    usage: "blacklist [add/remove] [username]"
}