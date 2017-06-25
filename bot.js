//------------Initialization-----------------------
const Discord = require('discord.js');
const Twit = require('twit');
const config = require('./config.json');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

//------------------Twitter------------------------
var twitterGuild = null;

var T = new Twit({
    consumer_key: config.twit_consumer_key,
    consumer_secret: config.twit_consumer_secret,
    access_token: config.twit_access_key,
    access_token_secret: config.twit_access_secret
});

var stream = T.stream('statuses/filter', { follow: [config.twit_user_id] });

stream.on('connect', function(request){
    console.log("Connecting to Twitter...");
})

stream.on('connected', function(response){
    console.log("Connected to Twitter!");
})

stream.on('error', function(err){
    console.log(err.message);
})

stream.on('tweet', function (tweet, err) {
    console.log("Tweet found!");
    if(twitterGuild)
        findOnDiscord(twitterGuild, 'channel', 'bottesting').send({embed: createEmbed(tweet.text)}).then(() => console.log("Deliver tweet to Discord")).catch(console.error);
    
});
//-----------------Discord Bot -------------------- 
const streamOptions = {seek: 0, volume: 1};

var musicQueue = [];
var voiceChannel = null;

let responseList = {
    "help": ":sweet_potato: This bot knows how to: \n\n" +
    "`1`   **music** `Ex. !music summon`\n" + 
    "           `summon` - Summons bot to your current voice channel or to the `General` voice channel if there is any. \n" +
    "           `dismiss` - Removes bot from any voice channel it is currently in. \n" +
    "           `play` - Plays the first song in the queue. \n" +
    "           `queue <Youtube URL>` - Queues a song to be played by the bot. \n" +
    "`2`   **addrole** `@SumMCSS` `<nameOfRole>` - Adds the role(s) to specified user. \n" +
    "`3`   **cs_meme** - Get a randomized text string in a list about your chances of getting into the CS Post! \n" +
    "`4`   **Fun** - Type in `ping, tableflip, lenny, shrug, cs_meme` and find out what they do! \n" +
    "\nPlease prefix these commands with the correct prefix! It is currently set to: `" + config.prefix + "`", 
    "ping": "pong",
    "tableflip": "(╯°□°）╯︵ ┻━┻)",
    "lenny": "( ͡° ͜ʖ ͡°)",
    "shrug": "¯\_(ツ)_/¯",
    "cs_meme": cs_meme()
};

var youtubeURLRegex = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

client.on('ready', () => {
    console.log('Potato online!');
    client.user.setGame('potatoes');
    
    twitterGuild = findOnDiscord(client, 'guild', config.main_guild); 
});

client.on('message', msg => {   
    if(!isCommand(msg)){return;}

    var command = msg.content.slice(1);
    if(responseList[command]) msg.channel.send(responseList[command]);
    if(command === 'hello') msg.channel.send({embed: createEmbed("testing")});

    var commandArgs = command.split(' ');
    
    // Music Commands
    if(command.startsWith('music')){
        
        if(commandArgs[1] === 'summon') joinVoiceChannel('General', msg);
        if(commandArgs[1] === 'dismiss') leaveVoiceChannel(msg);

        if(comandArgs[1] === 'play'){
            if(voiceChannel){
                if(musicQueue.length != 0){
                    msg.channel.send('Playing song');
                    const stream = ytdl(musicQueue.shift(), {filter : 'audioonly'});
                    const dispatcher = client.voiceConnections.first().playStream(stream, streamOptions);
                    
                }else msg.channel.send('There is nothing queued to play.');
            }else msg.channel.send('I am not in a voice channel at the moment.');
        }

        if(commandArgs[1] === 'queue'){
            if(commandArgs.length > 2 && commandArgs[2].match(youtubeURLRegex)){
                musicQueue.push(commandArgs[2]);
                msg.channel.send('Song added to queue');
                
            }else msg.channel.send('Invalid or no Youtube URL specified.');
            
        }
        
        //Think about making a command that combines queue+play
        
    }
    
    //General Utility Commands
    if(command.startsWith('addrole')){
        let rolesToAdd = [];
        let person = msg.guild.member(msg.mentions.users.first());
        
        //if()
        
        for(i = 2; i < commandArgs.length; i++){
            if(!msg.guild.roles.exists('name', commandArgs[i])) msg.channel.send("The role *" + commandArgs[i] + "* does not exist.");
            else rolesToAdd.push(msg.guild.roles.find('name', commandArgs[i]));
        }
        
        person.addRoles(rolesToAdd).then(() => console.log("Adding role(s):" + rolesToAdd + " to: " + person.user.username)).catch(console.error);
    }
    
});
//Auto-role assignment
client.on('guildMemberAdd', member => {
    const entryRole = 'Guest';
    member.addRole(member.guild.roles.find('name', entryRole));
});

client.on('disconnect', evt => {
    if(evt.code === 1006){
        client.destroy.then(() => client.login(config.token));
    }
});

//If I want to test this bot, go into Terminal and go to this folder and run node bot.js
client.login(config.token);

//-----------------Functions------------------------
function isCommand(msg){return msg.content.startsWith(config.prefix) && !msg.author.bot}

function joinVoiceChannel(channelName, msg){
    if(voiceChannel){
        leaveVoiceChannel(msg);  
    }
    
    if(!msg.guild.available){
        msg.channel.send('Server/guild not available.');
        return;
    }
    
    voiceChannel = findOnDiscord(msg.guild, 'channel', channelName);
    if(voiceChannel){
        voiceChannel.join().then(connection => console.log('Connecting to ' + voiceChannel.name + ' voice channel...')).catch(console.error);
    }
}

function leaveVoiceChannel(msg){
    if(voiceChannel){
        voiceChannel.leave();
        console.log('Disconnecting from ' + voiceChannel.name + ' voice channel...');
        voiceChannel = null;
    }else{
        msg.reply("Nothing to disconnect from.");
    }
    
}

function findOnDiscord(msg, query, search){
    if(query === 'channel'){
        return msg.channels.find(val => val.name === search);
    }else if(query === 'guild'){
        return msg.guilds.get(search);
    }else {
        console.log("Error in filtering Discord properties");
        return null;
    }
}

function cs_meme(){
    let memeing = [
        "Please ask in April/May",
        "How about you try at UTSG?"
    ];
    
    return memeing[Math.floor(Math.random() * memeing.length)];
}

// NOTE TO SELF: if want to reference to actual tweet. Do www.twitter.com/<username>/status/<tweet's id_str>
// If there is picture, access tweet.entities.media.media_url
function createEmbed(msg){
    const embedOptions = {
        "title": "MCSS Twitter!",
        "url": "https://twitter.com/utmmcss?lang=en",
        "description": msg,
        "color": 16777215,
        "timestamp": new Date(),
        "footer": {
            "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
            "text": "Brought to you by the MCSS Team!~"
        },
        "thumbnail": {
            "url": "https://cdn.discordapp.com/embed/avatars/0.png"
        },
        "author": {
            "name": "Potato Bot",
            "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png"
        },
        "fields": [
            {
                "name": "MCSS Website",
                "value": msg,
                "inline": true
            },
            {
                "name": "Blah",
                "value": "hello",
                "inline": true
            }
      ]
    };
    return embedOptions;
}