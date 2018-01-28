var fs = require("fs");

var request = require('request');


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


function readCharInfosByBaseId(message, baseId, stars) {
    
    message.channel.send("baseId = " + baseId);
    
    request({ url: "https://swgoh.gg/api/guilds/9563/units/?format=json", json: true }, function (error, response, body) {

        /*
        message.channel.send("error = " + error);
        message.channel.send("response.statusCode = " + response.statusCode);
        message.channel.send("body = " + body);
        */

        if (!error && response.statusCode === 200) {
            
            message.channel.send(el.GRIEVOUS);
            
            message.channel.send("Length = " + el.GRIEVOUS.length);
            
            
            /*
            var results = body.filter(function(el) {
            
                return (el.Char.toLowerCase() == charName.toLowerCase() || getShortName(el.Char).toLowerCase() == charName.toLowerCase()) && el.Stars >= stars;
            });
            
            var baseId = "";
            
            body.some(function (el, index, _arr) {
                
                var name = el.name.toLowerCase();
                if(name == charName.toLowerCase() || getShortName(name).toLowerCase() == charName.toLowerCase()) {
                    baseId = el.base_id;
                    return true;
                }
                
                return false;
            });
            
            if(baseId == "") {
                message.channel.send("Kein Treffer gefunden...");
                return;
            }*/
        }
    })
}

function readCharInfos(message, messageElements) {
    
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
    
    request({ url: "https://swgoh.gg/api/characters/?format=json", json: true }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            
            var baseId = "";
            
            body.some(function (el, index, _arr) {
                
                var name = el.name.toLowerCase();
                if(name == charName.toLowerCase() || getShortName(name).toLowerCase() == charName.toLowerCase()) {
                    baseId = el.base_id;
                    return true;
                }
                
                return false;
            });
            
            if(baseId == "") {
                message.channel.send("Kein Treffer gefunden...");
                return;
            }
            
            readCharInfosByBaseId(message, baseId, stars);
        }
    })
    
    /*
    fs.readFile("chars.json", function (err, data) {
        
        var obj = JSON.parse(data);
        
        var results = obj.Chars.filter(function(el) {
            return (el.Char.toLowerCase() == charName.toLowerCase() || getShortName(el.Char).toLowerCase() == charName.toLowerCase()) && el.Stars >= stars;
        });
        
        if(results.length == 0) {
            message.channel.send("Keine Treffer gefunden...");
            return;
        }
        
        var infos = [];
        //infos.push("*" + getUpdatedDateString() + "*");
        
        results = results.sort(function(a, b) {
        
            if(a.Stars > b.Stars)
                return 1;
            if(a.Stars < b.Stars)
                return -1;
            
            var nameA = a.User.toUpperCase();
            var nameB = b.User.toUpperCase();
            if (nameA < nameB)
                return -1;
            if (nameA > nameB)
                return 1;
                
            return 0;
        });
        
        results.forEach(function (el) {
            if(infos.length == 0)
                infos.push("Search **" + el.Char + "**");
            infos.push(el.Stars + " Sterne - " + el.User);
        });
        
        message.channel.send(infos.join("\n"));
    });
    */
}

function getShortName(s) {
    
    var elements = s.split(' ');
    var n = "";
    elements.forEach(function (el) {
        n += el[0];
    });
    return n;    
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