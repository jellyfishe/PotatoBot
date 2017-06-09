//------------Initialization-----------------------
const Discord = require('discord.js');
const Twit = require('twit');
const config = require('./config.json');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

//------------------Twitter------------------------
var twitterGuild;

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
    findOnDiscord(twitterGuild, 'channel', 'bottesting').send({embed: createEmbed(tweet.text)});
    
});
//-----------------Discord Bot --------------------
const streamOptions = {seek: 0, volume: 1};

var musicQueue = [];
var voiceChannel = null;

var playRegex = /^(play)\s(.*)$/;
var youtubeURLRegex = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

client.on('ready', () => {
    console.log('Potato online!');
    client.user.setGame('potatoes');
    
    twitterGuild = findOnDiscord(client, 'guild', config.main_guild); 
});

client.on('message', msg => {   
    if(!isCommand(msg)){return;}

    var command = msg.content.slice(1);
    if(command === 'help') msg.channel.send('What can I help with?');
    if(command === 'ping') msg.channel.send('pong');

    // Music Commands
    if(command.startsWith('music')){

        var mCommand = command.split(' ');
        
        if(mCommand[1] === 'summon') joinVoiceChannel('General', msg);
        if(mCommand[1] === 'dismiss') leaveVoiceChannel(msg);

        if(mCommand[1] === 'play'){
            if(voiceChannel){
                if(musicQueue.length != 0){
                    msg.channel.send('Playing song');
                    const stream = ytdl(musicQueue.shift(), {filter : 'audioonly'});
                    const dispatcher = client.voiceConnections.first().playStream(stream, streamOptions);
                }else{
                    msg.channel.send('There is nothing queued to play.');
                }
            }else{
                msg.channel.send('I am not in a voice channel at the moment.');
            }
        }

        if(mCommand[1] === 'queue'){
            if(mCommand.length > 2 && mCommand[2].match(youtubeURLRegex)){
                musicQueue.push(mCommand[2]);
                msg.channel.send('Song added to queue');
            }else {
                msg.channel.send('Invalid or no Youtube URL specified.');
            }
            
        }
        
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
        voiceChannel.join().then(connection => console.log('Connected to ' + voiceChannel.name + ' voice channel!')).catch(console.error);
    }
}

function leaveVoiceChannel(msg){
    if(voiceChannel){
        voiceChannel.leave();
        console.log('Disconnected from ' + voiceChannel.name + ' voice channel.');
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

function createEmbed(msg){
    const embedOptions = {
      "title": "MCSS Twitter!",
      "color": 12492676,
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
        "url": "https://discordapp.com",
        "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png"
      },
      "fields": [
        {
          "name": "Content",
          "value": msg
        }
      ]
    };
    return embedOptions;
}