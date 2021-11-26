const {Client, Intents} = require('discord.js');
const { prefix, token } = require('./config.json');
const execute = require('./Components/execute');
const queue = new Map();
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});
//function used to build a list of current songs
const displayList = serverQueue =>{
    //shows the list of songs in the queue
    let separator = '\n',
        bs = '';
    //don't show the curent result and build string to display to user
    serverQueue.songs.map((song, ind) => {
        if(ind === 0){
            bs = 'Current: '
        }
        bs+=song.title+separator
    })
    // return the built string
    return bs;
};

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
    const {content, channel} = message;
    // catches before execute 
    if (message.author.bot) return;
    if (!content.startsWith(prefix)) return;
    if (content == prefix) {
        return channel.send('If you need help with anything gimme a -h after that there \'+\'.\n\'+ -h\'')
    }

    let serverQueue = queue.get(message.guild.id),
        checkFor = action => content.startsWith(`${prefix}${action}`);


    if (checkFor('play')) {
        return execute.runAction(message, serverQueue, queue);
    } else if(checkFor('list')) {
        if(!serverQueue || serverQueue.songs == []){
            return channel.send('There are none');
        }
        channel.send(`Here are the remaing track's in the list:\n${displayList(serverQueue)}`)
    } else if (checkFor('skip')) {
        const noNoStatus = 'not-in-vc' || 'empty-queue';
        skipResp = execute.skip(message, serverQueue);
        serverQueue = skipResp.newServerQueue;
        if(skipResp.state.includes(noNoStatus)){
            return channel.send('Could not skip song... please ensure that:\n1. there are songs in the queue\n2. You are currently in a voice chat')
        } else if(skipResp.state.includes('empty-queue')) {
            return channel.send('Okay fine... I\'ll shutup.')
        } else {
            return channel.send(`I agree... that song is trash...\nHere are the remaing track's in the list:\n${displayList(serverQueue)}`)
        }
    } else if (checkFor('stop')) {
        const noNoStatus = 'no-tracks' || 'serv-prev-disc' || 'not-in-vc'
        const stopRes = execute.stop(message, serverQueue);
        if(stopRes.includes(noNoStatus)){
            return channel.send('Can not complete your request.\nPlease ensure you are...\n1. In a voice channel\n2. There is currently music being played to your voice channel')
        } else {
            return channel.send('Okay, I\'ll shut up')
        }
    } else if (checkFor(' -h')) {
        return channel.send('you can play youtube songs via \'+play {youtube link}\'\nyou can also skip songs or stop everthing all together by typing either \'+skip\' or \'+stop\'.');
    } else {
        return channel.send("You need to enter a valid command! - type '+ -h'");
    }
});

client.login(token);