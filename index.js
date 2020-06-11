const Discord = require('discord.js');
const client = new Discord.Client();
const login = '';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({ activity: { name: 'wth the fabric of reality' }});
 });

client.on('message', msg => {
    if (msg.author.bot || !msg.guild) return;
    
    if(msg.content.substring(0,3) === '^8b'){ 
        let roll = Math.floor(Math.random() * 8);
        if(msg.content.substring(3,4) != ' ' || msg.content.length <= 4){ msg.reply("... ask me something, fool.");}
        else if (roll == 0){ msg.reply("🎱 ... mayhaps..");}
        else if (roll == 1){ msg.reply("🎱 ... It is certian.");}
        else if (roll == 2){ msg.reply("🎱 ... Don't count on it.");}
        else if (roll == 3){ msg.reply("🎱 ... Only if you make it true.");}
        else if (roll == 4){ msg.reply("🎱 ... I can't be sure, but my guess is no.");}
        else if (roll == 5){ msg.reply("🎱 ... oh dear... are you sure you want to the answer to that?");}
        else if (roll == 6){ msg.reply("🎱 ... no.");}
        else if (roll == 7){ msg.reply("🎱 ... you waste my time. (try again)");}
    } //8ball
    
    if(msg.content.includes('<@!' + client.user.id + '>')){
        const pingAnger = new Discord.MessageAttachment('images/pingAnger.png');
        msg.channel.send(`<@${msg.author.id}> I've been up since ${client.readyAt}`,pingAnger);
    } //angrily responds to pings
    
    if(msg.member.presence.status === "offline"){
        const ghostRole = msg.guild.roles.cache.find(r => r.name === "Ghost 👻");
        if(msg.member.roles.cache.has(ghostRole.id)){
            //ghosting previously detected
        }
        else{
            msg.member.roles.add(ghostRole);
            msg.reply(`you were just caught GHOSTING.  Here's your obligatory ghost role 👻`);
        }
    } //ghost catcher
    if(msg.content.toLowerCase() === 'Acumen'){
        msg.channel.send(`howdy!`);
    } //says hi
    
    if(msg.content.substring(0,18).toLowerCase() == 'your next line is '){
        msg.channel.send(msg.content.substring(18) + "  .... N A N I ? ! ? !");
    } //next line echoer
    
    if(msg.content.length >= 15){
        const keyboardRole = msg.guild.roles.cache.find(r => r.name === "Keyboard Warrior ⌨️");
        if(!msg.member.roles.cache.has(keyboardRole.id)){
            let capitals = 0;
            for(let x = 0; x < msg.content.length; x++){
                if(msg.content[x] != msg.content[x].toLowerCase()){ capitals++;}
            }
            if(capitals >= msg.content.length * .75){
                msg.reply('you have successfully screamed yourself into a new role.  Welcome, keyboard warrior! ⌨️⌨️⌨️');
                msg.member.roles.add(keyboardRole);
            }
        }
        
    } //keyboard warrior detection
});

client.login(login);