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
            if (role.name == "Kopfgeldjäger" || role.name == "Verrückte Helden" || role.name == "Gast" || role.name == "Gilde der Jediritter")
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
    
    try {
    
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
                embed.setThumbnail(imageUrl);
                
                var charCounter = 0;
                
                for(var i = stars; i <= 7; i++) {
                
                    var results = users.filter(function(el) {
                        return el.rarity == i;
                    });
                    
                    var starCharCounter = 0;
                    var infos = [];
                    
                    results.forEach(function (el) {
                        infos.push(el.power + " Power - " + el.player);
                        //infos.push("(" + el.power + ") " + el.player);
                        charCounter++;
                        starCharCounter++;
                    });
                    
                    if(infos.length > 0) {
                        
                        var text = infos.join("\n");
                        if(text.length > 1024)
                            text = text.substr(0, 1020) + "...";
                        
                        embed.addField("**" + i + " Sterne (" + starCharCounter + ")**", text);
                    }
                }
                
                embed.setTitle(charName + " (" + charCounter + ")");
                
                message.channel.send({embed});
            }
        })
    }
    catch(ex) {
            message.channel.send("Interner Fehler... probiere es gleich erneut");
    }
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
    
    try {
    
        request({ url: url, json: true }, function (error, response, body) {

            if (!error && response.statusCode === 200) {
                
                var toons = findToons(body, charName);
                if(toons.length == 0) {
                    message.channel.send("Kein Treffer gefunden");
                    return;
                }
                
                if(toons.length > 3) {
                    message.channel.send(toons.length + " Treffer gefunden. Bitte schränke die Suche ein.");
                    return;
                }
                
                for(var i = 0; i < toons.length; i++) {
                    var toon = toons[i];
                    readGuildInfos(message, toon.base_id, stars, toon.name, "https:" + toon.image);
                }
            }
        })
    }
    catch(ex) {
            message.channel.send("Interner Fehler... probiere es gleich erneut");
    }
}

function findToons(toons, charName) {

    var searchName = charName.toLowerCase();
    var results = [];
    
    for(var i = 0; i < toons.length; i++) {
        
        var toon = toons[i];
        var name = toon.name.toLowerCase();
        if(name == searchName || getShortName(name).toLowerCase() == searchName) {
            results.push(toon);
            break;
        }
    }

    if(results.length > 0)
        return results;

    toons.forEach(function (toon) {
        var name = toon.name.toLowerCase();
        if(name.includes(charName))
            results.push(toon);
    });
    
    return results;
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

    try {

        request({ url: CHAR_URL, json: true }, function (charError, charResponse, chars) {

            if (!charError && charResponse.statusCode === 200) {

                request({ url: GUILD_URL, json: true }, function (error, response, body) {

                    if (!error && response.statusCode === 200) {
                        
                        var rareChars = [];
                        
                        for (var i = 0; i < chars.length; i++) {
                            
                            var character = chars[i];
                            var baseId = character.base_id;
                            var users = body[baseId];
                            var counter = 0;
                            
                            for(var j = 0; j < users.length; j++) {
                                var user = users[j];
                                if(user.rarity == 7)
                                    counter++;
                            }
                            
                            if(counter < 12)
                                rareChars.push(character.name + " (" + counter + "/12)");
                        }
                        
                        var rareCharMessage = rareChars.join('\n');
                        message.channel.send(rareCharMessage);
                    }
                })
            }
        })
    }
    catch(ex) {
            message.channel.send("Interner Fehler... probiere es gleich erneut");
    }
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
            
            case 'gdjmember':
                registerRole(guild, message, "Gilde der Jediritter");
                break;
            
            case 'gastmember':
                registerRole(guild, message, "Gast");
                break;
            
            case 'help':
                var helpMessage =   'Verfügbare Befehle:\n' +
                                    '**!kgjmember** - "Kopfgeldjäger" Rolle zuweisen\n' +
                                    '**!vhmember** - "Verrückte Helden" Rolle zuweisen\n' +
                                    '**!gdjmember** - "Gilde der Jediritter" Rolle zuweisen\n' +
                                    '**!gastmember** - "Gast" Rolle zuweisen\n';
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