var fs = require("fs");

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
    
    message.channel.send("try to read json test");
    
  /*  

var url = "http://developer.cumtd.com/api/v2.2/json/GetStop?" +
    "key=d99803c970a04223998cabd90a741633" +
    "&stop_id=it";

request({
    url: url,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        
        message.channel.send(body);
    }
})*/
    
    /*
    var stars = parseInt(messageElements[messageElements.length - 1]) || 0;
    if(stars < 1 || stars > 7) {
        message.reply('Bitte am Ende die Anzahl der mind. Sterne angeben (1-7)');
        return;
    }
    
    var charName = "";
    for(var i = 1; i < messageElements.length - 1; i++) {
        if(i > 1)
            charName += " ";
        charName += messageElements[i];
    }
    
    // TODO: JSON Daten auslesen...
    var str = '{ "Chars": [';
    str += '{ "Char": "Kylo Ren", "User": "Caly Phornia", "Stars": 4 },';
    str += '{ "Char": "Kylo Ren", "User": "Sammelstelle", "Stars": 6 },';
    str += '{ "Char": "Kylo Ren", "User": "Recipro", "Stars": 7 }';
    str += "]}";
    
    var obj = JSON.parse(str);
    
    var results = obj.Chars.filter(function(el) {
        return el.Char.toLowerCase() == charName.toLowerCase() && el.Stars >= stars;
    });
    
    if(results.length == 0) {
        message.channel.send("Keine Treffer gefunden...");
        return;
    }
    
    var infos = [];
    infos.push("*" + getUpdatedDateString() + "*");
    
    results.forEach(function (el) {
        infos.push(el.Stars + " Sterne - " + el.User);
    });
    
    message.channel.send(infos.join("\n"));
    */
}

function getUpdatedDateString() {
    var currentdate = new Date();
    var datetime = "Aktualisierung: " + currentdate.getDate() + "."
                + (currentdate.getMonth()+1)  + "." 
                + currentdate.getFullYear() + " - "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds() + " Uhr";
                return datetime;   
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