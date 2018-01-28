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


function readCharInfosByBaseId(message, baseId, stars, charName, imageUrl) {
    
    request({ url: "https://swgoh.gg/api/guilds/9563/units/?format=json", json: true }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            
            var users = body[baseId];
            users = users.sort(function(a, b) {
        
                if(a.rarity > b.rarity)
                    return 1;
                if(a.rarity < b.rarity)
                    return -1;
                
                if(a.power > b.power)
                    return 1;
                if(a.power < b.power)
                    return -1;
                
                var nameA = a.player.toUpperCase();
                var nameB = b.player.toUpperCase();
                if (nameA < nameB)
                    return -1;
                if (nameA > nameB)
                    return 1;
                    
                return 0;
            });

            const embed = new Discord.RichEmbed();
            embed.setColor(3800852);
            embed.setTitle(charName);
            embed.setThumbnail(imageUrl);
            
            for(var i = stars; i <= 7; i++) {
            
                var results = users.filter(function(el) {
                    return el.rarity == i;
                });
                
                var infos = [];
                results.forEach(function (el) {
                    infos.push(el.power + " Power - " + el.player);
                });
                
                if(infos.length > 0) {
                    
                    var text = infos.join("\n");
                    if(text > 1024)
                        text = text.substr(0, 1020) + "...";
                    embed.addField("**" + i + " Sterne**", text);
                }
            }
            
            message.channel.send({embed});
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
            
            var base_id = "";
            var image_url = "";
            var char_name = "";
            
            body.some(function (el, index, _arr) {
                
                var name = el.name.toLowerCase();
                if(name == charName.toLowerCase() || getShortName(name).toLowerCase() == charName.toLowerCase()) {
                    
                    base_id = el.base_id;
                    image_url = el.image;
                    char_name = el.name;
                    return true;
                }
                
                return false;
            });
            
            if(base_id == "") {
                message.channel.send("Kein Treffer gefunden...");
                return;
            }
            
            readCharInfosByBaseId(message, base_id, stars, char_name, "https:" + image_url);
        }
    })
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