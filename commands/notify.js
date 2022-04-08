const discord = module.require("discord.js");

module.exports.run = async function(client, message, args) {
	const role = message.guild.roles.cache.find(role => role.name === 'Ignore')
	
	if (role) {
		var text = "true";
		if (message.member.roles.cache.some(role => role.name === 'Ignore')) {
			message.member.roles.remove(role);
		}
		else {
			message.member.roles.add(role);
			var text = "false";
		}
		
		const embed = {
		  "description": `You set notifications to: \`${text}\``,
		  "color": 7551404,
		  "author": {
			"name": "Toggled Notifications",
			"icon_url": `${message.author.avatarURL()}`
		  }
		};
		message.channel.send({ embed });
	}
};

module.exports.help = {
    name: "notify",
    description: "Toggles whether you get notified for events.",
    usage: "notify"
}