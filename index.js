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

function readCharInfos(message, messageElements) {
    
        message.channel.send("versuche die infos auszulesen...");
        
    var stars = parseInt(messageElements[messageElements.length - 1]) || 0;
    if(stars <= 1 || stars >= 7) {
        message.reply('Bitte am Ende die Anzahl der mind. Sterne angeben (1-7)');
        return;
    }
    
    message.channel.send("TODO: Char wird bald mit " + stars + " Sternen ausgelesen :-)");
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
            
        case 'char':
            readCharInfos(message, messageElements);
            break;
            
        case 'help':
            var helpMessage =   'Verfügbare Befehle:\n' +
                                '**!kgjmember** - "Kopfgeldjäger" Rolle zuweisen\n' +
                                '**!vhmember** - "Verrückte Helden" Rolle zuweisen\n' +
                                '**!gastmember** - "Gast" Rolle zuweisen\n' +
                                '**!ping** - pong!\n' +
                                '**!piep** - lass dich überraschen...';
            message.channel.send(helpMessage);
            break;
            
        default:
            message.reply('den Command **`' + commandModifier + command + '`** gibt es leider nicht');
    }
});

client.login(process.env.BOT_TOKEN);