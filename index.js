const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
});

function registerRole(guild, message, roleName) {
    
    guild.fetchMember(message.author).then(guildMember => {

        for (let role of guildMember.roles) {
            role = role[1];
            if (role.name == "Kopfgeldjäger" || role.name == "Verrückte Helden")
                guildMember.removeRole(role);
        }

        for (let role of guild.roles) {
            
            role = role[1];

            if (role.name === roleName) {
                
                message.reply('Willkommen bei "' + roleName + '"');

                guildMember.addRole(role).catch(error => {
                    console.error(error);
                });

                return;
            }
        }
        
        message.reply('Rolle "' + roleName + '" wurde nicht gefunden');

    }).catch(error => {
        console.error(error);
    });
}

const commandModifier = '!';

client.on('message', message => {
   
    if (!message.content.startsWith(commandModifier)) {
        return;
    }
    
    let messageElements = message.content.split(' ');
    let command         = messageElements[0].substring(commandModifier.length);
    let guild           = message.guild;
    
    switch (command) {
        
        case 'ping':
            console.log("pong");
            message.reply('pong');
            break;

        case 'kgjmember':
            registerRole(guild, message, "Kopfgeldjäger");
            break;
            
        case 'vhmember':
            registerRole(guild, message, "Verrückte Helden");
            break;

        default:
            message.reply('den Command **`' + commandModifier + command + '`** gibt es leider nicht');
    }
});

client.login(process.env.BOT_TOKEN);