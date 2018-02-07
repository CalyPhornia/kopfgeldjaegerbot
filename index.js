var fs = require("fs");
var request = require('request');
var schedule = require('node-schedule');
const Discord = require('discord.js');
const client = new Discord.Client();

var CHAR_URL = "https://swgoh.gg/api/characters/?format=json";
var GUILD_URL = "https://swgoh.gg/api/guilds/9563/units/?format=json";

client.on('ready', () => {
    
    console.log('I am ready!');
    
    var ruleRancor = new schedule.RecurrenceRule();
    ruleRancor.dayOfWeek = [0, 2, 4];
    ruleRancor.hour = 17; // UTC Zeit
    ruleRancor.minute = 0;
    var rancor = schedule.scheduleJob(ruleRancor, function() {
        var channel = client.channels.get('283306148747149314');
        channel.send("@everyone Bitte 'RANCOR' starten");
    });

    var ruleHaat = new schedule.RecurrenceRule();
    ruleHaat.dayOfWeek = [1, 3];
    ruleHaat.hour = 17; // UTC Zeit
    ruleHaat.minute = 0;
    var haat = schedule.scheduleJob(ruleHaat, function() {
        var channel = client.channels.get('283306148747149314');
        channel.send("@everyone Bitte 'HAAT' starten");
    });
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

function readGuildInfos(message, baseId, stars, charName, imageUrl) {
    
    request({ url: "https://swgoh.gg/api/guilds/9563/units/?format=json", json: true }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            
            var users = body[baseId];
            if(users === undefined) {
                console.log("users undefined");
                return;
            }
            
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
                    if(text.length > 1024)
                        text = text.substr(0, 1020) + "...";
                    embed.addField("**" + i + " Sterne**", text);
                }
            }
            
            message.channel.send({embed});
        }
    })
}

function readInfos(url, message, messageElements) {
    
    var stars = parseInt(messageElements[messageElements.length - 1]) || 0;
    var count = messageElements.length - 1;
    
    if(stars == 0) {
        stars = 1;
        count++;
    }
    
    var charName = "";
    for(var i = 1; i < count; i++) {
        if(i > 1)
            charName += " ";
        charName += messageElements[i];
    }
    
    request({ url: url, json: true }, function (error, response, body) {

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
            
            readGuildInfos(message, base_id, stars, char_name, "https:" + image_url);
        }
    })
}

function getShortName(s) {
    
    var elements = s.replace(/[^0-9a-z ]/gi, '').split(' ');
    var n = "";
    elements.forEach(function (el) {
        n += el[0];
    });
    return n;    
}

function findRareChars(message) {

    request({ url: CHAR_URL, json: true }, function (charError, charResponse, chars) {

        if (!charError && charResponse.statusCode === 200) {

            request({ url: GUILD_URL, json: true }, function (error, response, body) {

                if (!error && response.statusCode === 200) {
                    
                    var rareChars = [];
                    rareChars.push("Kylo Ren (7/12");
                    rareChars.push("Yoda (10/12");
                    
                    // TODO...
                    
                    var rareCharMessage = rareChars.join('\n');
                    message.channel.send(rareCharMessage);
                }
            })
        }
    })
}

const commandModifier = '!';

client.on('message', message => {
   
    if (!message.content.startsWith(commandModifier)) {
        return;
    }
    
    let messageElements = message.content.split(' ');
    let command         = messageElements[0].substring(commandModifier.length).toLowerCase();
    let guild           = message.guild;
    
    // VH Verbund Kongresszentrum
    if(guild.id == 402066089862758410) {
        
        switch (command) {
        
            case 'ping':
                message.reply('pong');
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
                var helpMessage =   'Verfügbare Befehle:\n' +
                                    '**!kgjmember** - "Kopfgeldjäger" Rolle zuweisen\n' +
                                    '**!vhmember** - "Verrückte Helden" Rolle zuweisen\n' +
                                    '**!gastmember** - "Gast" Rolle zuweisen\n' +
                                    '**!ping** - pong!';
                message.channel.send(helpMessage);
                break;
                
            default:
                message.reply('den Command **`' + commandModifier + command + '`** gibt es leider nicht');
        }
    }
    // VH KGJ Kopfgeldjäger
    else if(guild.id == 282945530240434178) {
        
        switch (command) {
        
            case 'ping':
                message.reply('pong');
                break;
            
            case 'c':
            case 'char':
                readInfos("https://swgoh.gg/api/characters/?format=json", message, messageElements);
                break;
                
            case 's':
            case 'ship':
                readInfos("https://swgoh.gg/api/ships/?format=json", message, messageElements);
                break;
                
            case 'rare':
                findRareChars(message);
                break;
            
            case 'help':
                var helpMessage =   'Verfügbare Befehle:\n' +
                                    '**!char [Charname] [mind. Sterne]** - User mit dem Char und mind. Sterne finden (geht auch mit !c) - Bsp.: !char Kylo Ren 6\n' +
                                    '**!ship [Shipname] [mind. Sterne]** - User mit dem Schiff und mind. Sterne finden (geht auch mit !s) - Bsp.: !ship Endurance 6\n' +
                                    '**!rare** - Listet alle seltenen Chars auf, die weniger als 12 User mit 7 Sternen besitzen\n' +
                                    '**!ping** - pong!';
                message.channel.send(helpMessage);
                break;
                
            case 'channel':
                message.channel.send(message.channel.id);
                break;

            case 'everyone':
                var channel = guild.channels.get('283306148747149314');
                channel.send("@everyone test 123");
                break;
                
            default:
                message.reply('den Command **`' + commandModifier + command + '`** gibt es leider nicht');
        }
    }
});

client.login(process.env.BOT_TOKEN);