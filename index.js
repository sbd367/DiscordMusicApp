const {Client, Intents} = require('discord.js');
const { prefix, token } = require('./config.json');
const execute = require('./Components/execute');
const queue = new Map();
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});

//log different status levels
client.once('ready', (readyState) => {
    console.log('ready state')
    console.log('Ready!');
});
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});

//when the client receives a message
client.on('messageCreate', message => {
    // catches before execute 
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    if (message.content == prefix) {
        return message.channel.send('If you need help with anything gimme a -h after that there \'+\'.\n\'+ -h\'')
    }

    const serverQueue = queue.get(message.guild.id);
    if (message.content.startsWith(`${prefix}play`)) {
        execute.runAction(message, serverQueue, queue);
        return;
    } else if (message.content.startsWith(`${prefix}skip`)) {
        execute.skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
        execute.stop(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix} -h`)) {
        message.channel.send('you can play youtube songs via \'+play {youtube link}\'\nyou can also skip songs or stop everthing all together by typing either \'+skip\' or \'+stop\'.');
        return;
    } else {
        message.channel.send("You need to enter a valid command! - type '+ -h'");
    }
});

client.login(token);