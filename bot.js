const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();
const ytdl = require('ytdl-core');

var musicQueue = [];
var voiceChannel = null;
const streamOptions = {seek: 0, volume: 1};

//Functions
function isCommand(msg){return msg.content.startsWith(config.prefix) && !msg.author.bot}

function GetChannelByName(name) {
    var channel = client.channels.find(val => val.name === name);

    return channel;
}
//End Functions

client.on('ready', () => {
    console.log('Potato online!');
    client.user.setGame('potatoes');
});

client.on('message', msg => {    
    if(isCommand(msg)){
        var command = msg.content.slice(1);
        
        if(command === 'help') msg.channel.sendMessage('What can I help with?');
        
        if(command === 'ping') msg.channel.sendMessage('pong');
        
        // Music Commands
        if(command.startsWith('music')){
            
            var mCommand = command.split(' ')[1];
            if(mCommand === 'summon'){
                if(voiceChannel){return;}
                
                voiceChannel = GetChannelByName('General');
                voiceChannel.join().then(connection => console.log('Connected to voice channel!')).catch(console.error);
            }
        
            if(mCommand === 'dismiss'){
                if(voiceChannel){
                    voiceChannel.leave();
                    voiceChannel = null;
                    console.log('Disconnected from voice channel!');
                    
                }else{
                    msg.channel.sendMessage('Nothing to disconnect from');
                }
                    
            }
            
            if(mCommand === 'play'){
                if(voiceChannel){
                    if(musicQueue.length != 0){
                        msg.channel.sendMessage('Playing song');
                        const stream = ytdl('https://www.youtube.com/watch?v=JY5NVzHtA5o', {filter : 'audioonly'});
                        const dispatcher = client.voiceConnections.first().playStream(stream, streamOptions);
                    }else{
                        msg.channel.sendMessage('There is nothing queued to play.');
                    }
                }else{
                    msg.channel.sendMessage('I am not in a voice channel at the moment.');
                }
            }
            
            if(mCommand === 'queue'){
                musicQueue.push('Object 1');
            }
        }
        
    }
    
});
//Auto-role assignment
client.on('guildMemberAdd', member => {
    const entryRole = 'Guest';
    member.addRole(member.guild.roles.find('name', entryRole));
});

//If I want to test this bot, go into Terminal and go to this folder and run node bot.js
client.login(config.token);