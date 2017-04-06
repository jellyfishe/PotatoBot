const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

var createCharaRegex = /^(Create new character)\s<(.*)>\s(<\w+>)\s(<\w+>)\s(?:\s|(strength)|(dexterity)|(constitution)|(intelligence)|(wisdom)|(charisma)){11}$/;

//Functions
function isCommand(msg){return msg.content.startsWith(config.prefix) && !msg.author.bot}
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
        
        if(command.startsWith('music')){
            var mCommand = command.split(' ')[1];
            const voiceChannel = msg.guild.channels.filter(g => {
                return g.type == 'voice' && g.name == 'General';
                }).first();
            
            if(mCommand === 'summon'){
                voiceChannel.join().then(connection => console.log('Connected voice channel!')).catch(console.error);
            }
        
            if(mCommand === 'dismiss'){
                if(voiceChannel.connection){
                    voiceChannel.leave();
                    console.log('Disconnected voice channel!');
                }
                    
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