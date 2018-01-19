const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
});

function registerRole(guild, message, roleName) {
    
    guild.fetchMember(message.author).then(guildMember => {

        for (let role of guildMember.roles) {
            role = role[1];
            if (role.name == "Kopfgeldjäger" || role.name == "Verrückte Helden" || role.name == "Gast")
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
    let command         = messageElements[0].substring(commandModifier.length).toLowerCase();
    let guild           = message.guild;
    
    switch (command) {
        
        case 'ping':
            message.reply('pong');
            break;
        
        case 'piep':
            message.reply('piep piep piep ich hab dich lieb...');
            break;
            
        case 'kgjmember':
            registerRole(guild, message, "Kopfgeldjäger");
            break;
            
        case 'vhmember':
            registerRole(guild, message, "Verrückte Helden");
            break;
        
        case 'gastmember':
            registerRole(guild, message, "Gast");
            break;
            
        case 'help':
            var helpMessage =   'Verfügbare Befehle:' +
                                '**!kgjmember** - "Kopfgeldjäger" Rolle zuweisen' +
                                '**!vhmember** - "Verrückte Helden" Rolle zuweisen' +
                                '**!gastmember** - "Gast" Rolle zuweisen' +
                                '**!ping** - pong!' +
                                '**!piep** - lass dich überraschen...';
            message.channel.send(helpMessage);
            break;
            
        default:
            message.reply('den Command **`' + commandModifier + command + '`** gibt es leider nicht');
    }
});

client.login(process.env.BOT_TOKEN);