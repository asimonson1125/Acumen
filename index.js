const Discord = require('discord.js');
const client = new Discord.Client();
const predictions = require('./predictNG/predict');
const fetch = require('node-fetch');
const login = require('./login');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

async function predictMessage(msg, id, numBattles) {
    let message = await msg.channel.send("Finding battle...");
    const prediction = await predictions.BattleSimulate(message, id, numBattles);
    if (prediction == "Encountered an error fetching units from battle") {
        msg.reply(prediction);
    }
    else {
        msg.reply("Here is my prediction of battle " + id + ":\n" + prediction[0] + "\n Individual unit stats will be DM'd to you momentarily...");
        msg.author.send("Data on units of battle " + id + ":\n");
        prediction[1].forEach(function (x) { msg.author.send(x); });
        msg.author.send("\n- Units are in the same order as listed ingame\n- Stats without data are noted with NaN");
    }
}

async function convertTimestamp(user, msg) {
    try {
        let a = await fetch(`https://api.nationsgame.net/users/getUser.php?user=${user}`, {
            "headers": {
                "accept": "application/json",
                "accept-language": "en-US,en;q=0.9",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site"
            },
            "referrer": `https://app.nationsgame.net/user/${user}`,
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });
        let b = await a.json();
        var theDate = new Date(b.lastAction * 1000);
        let dateString = theDate.toGMTString();
        if (b.lastAction > 1) {
            msg.reply(msg.content.substring(5) + "'s last action was on " + dateString);
        }
        else {
            throw "unable to find that user.";
        }
    } catch (e) {
        msg.reply("Error: " + e);
    }
}

function sleep(ms) { //make wait function
    return new Promise(resolve => setTimeout(resolve, ms));
}
let sendChannel;
async function deleteMessage(chan, response, wait) {
    let delme = await chan.send(response);
    await sleep(wait);
    delme.delete({});
}

client.on('message', msg => {
    if (msg.author.bot || !msg.guild) return;
    client.user.setPresence({ activity: { name: 'with the fabric of reality' } });
    try {
        if (msg.content.substring(0, 5) === '^ngp ') {
            if (msg.content.length < 6) { msg.reply("please give me an id."); }
            else {
                const id = parseInt(msg.content.substring(5, 12));
                let numBattles = parseInt(msg.content.substring(13));
                if (isNaN(numBattles)) { numBattles = 100; }
                if (numBattles > 10001) { msg.reply("Please don't make me simulate more than 10001 times... My host computer thanks you."); }
                else {
                    predictMessage(msg, id, numBattles);
                }
            }
        } // ng battle predictions

        if (msg.content.substring(0, 5) === '^act ') {
            convertTimestamp(msg.content.substring(5), msg);
        }

        if (msg.content.substring(0, 3) === '^8b') {
            let roll = Math.floor(Math.random() * 8);
            if (msg.content.substring(3, 4) != ' ' || msg.content.length <= 4) { msg.reply("... ask me something, fool."); }
            else if (roll == 0) { msg.reply("🎱 ... mayhaps.."); }
            else if (roll == 1) { msg.reply("🎱 ... It is certian."); }
            else if (roll == 2) { msg.reply("🎱 ... Don't count on it."); }
            else if (roll == 3) { msg.reply("🎱 ... Only if you make it true."); }
            else if (roll == 4) { msg.reply("🎱 ... I can't be sure, but my guess is no."); }
            else if (roll == 5) { msg.reply("🎱 ... oh dear... are you sure you want to the answer to that?"); }
            else if (roll == 6) { msg.reply("🎱 ... no."); }
            else if (roll == 7) { msg.reply("🎱 ... you waste my time. (try again)"); }
        } //8ball
        bot_owner_id = ""
        if (msg.author.id == bot_owner_id) { //if bot owner is the author
            if (msg.content == "^set") {
                sendChannel = msg.channel;
                deleteMessage(msg.channel, "all set.", 500);
            }
            if (msg.content.substring(0, 6) == "^send ") {
                sendChannel.send(msg.content.substring(6));
                msg.reply("sent.");
            }

            if (msg.content.substring(0, 3) == "^gc") {
                //msg.guild.channels.cache.each(channel => msg.channel.send(channel.name));
                let arr = [], categories =[], text =[], other = [];
                client.guilds.cache.each(guild => arr.push(guild));
                arr.forEach(function (x) {
                    if (x.id == msg.content.substring(4)) {
                        let detectedChannels = [];
                        x.channels.cache.each(channel => detectedChannels.push(channel));
                        detectedChannels.forEach(function (chan) {
                            if (chan.type == "category") {
                                categories.push(chan);
                            }
                            else if (chan.type == "text") {
                                text.push(chan);
                            }
                            else {
                                other.push(chan);
                            }
                        });
                        msg.channel.send("**Categories:**");
                        categories.forEach(function (chan) {
                            msg.channel.send(chan.name);
                        });
                        msg.channel.send("**Text Channels:**");
                        text.forEach(function (chan) {
                            msg.channel.send(chan.name);
                        });
                        if (other.length > 0) {
                            msg.channel.send("**Others:**");
                            other.forEach(function (chan) {
                                msg.channel.send(chan.name);
                            });
                        }

                        msg.reply("all done!");
                    }
                });
            }
        }

        if (msg.content.substring(0, 5).toLowerCase() == "i am " && msg.content.length < 35) {
            msg.channel.send("Hi " + msg.content.substring(5) + ", I'm Acumen!");
            console.log("Dad joked " + msg.author.tag + " with " + msg.content.substring(5));
        }
        if (msg.content.substring(0, 11) == "^impossible") {
            msg.channel.send("​​​​");
        }

        if (msg.content.includes('<@!' + client.user.id + '>')) {
            const pingAnger = new Discord.MessageAttachment('images/pingAnger.png');
            msg.channel.send(`<@${msg.author.id}> I've been up since ${client.readyAt}`, pingAnger);
        } //angrily responds to pings

        if (msg.member.presence.status === "offline") {
            try {
                const ghostRole = msg.guild.roles.cache.find(r => r.name === "Ghost 👻");
                if (msg.member.roles.cache.has(ghostRole.id)) {
                    //ghosting previously detected
                }
                else {
                    msg.member.roles.add(ghostRole).catch(error => msg.reply(`Error: ${error}`));
                    msg.reply(`you were just caught GHOSTING.  Here's your obligatory ghost role 👻`);
                }
            } catch (error) { console.log("couldn't find ghost role") }
        } //ghost catcher
        if (msg.content.toLowerCase() === 'Acumen') {
            msg.channel.send(`howdy!`);
        } //says hi

        if (msg.content.substring(0, 18).toLowerCase() == 'your next line is ') {
            msg.channel.send(msg.content.substring(18) + "  .... N A N I ? ! ? !");
        } //next line echoer

        if (msg.content.length >= 30) {
            try {
                let capitals = 0;
                for (let x = 0; x < msg.content.length; x++) {
                    if (msg.content[x] != msg.content[x].toLowerCase()) { capitals++; }
                }
                const keyboardRole = msg.guild.roles.cache.find(r => r.name === "Keyboard Warrior ⌨️");
                if (capitals >= msg.content.length * .75 && !msg.member.roles.cache.has(keyboardRole.id)) {
                    msg.member.roles.add(keyboardRole).catch(error => msg.reply(`Error: ${error}`));
                    msg.reply('you have successfully screamed yourself into a new role.  Welcome, keyboard warrior! ⌨️⌨️⌨️');
                }
            } catch (error) { console.log("couldn't find keyboard warrior role") }

        } //keyboard warrior detection
    } catch (error) { msg.channel.send("an error occured, make sure I have the appropriate permissions to do whatever you are asking me to do do."); console.log(error);}
});

login.login(client);
