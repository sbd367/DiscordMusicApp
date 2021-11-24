const {Client, Intents} = require('discord.js');
const {joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus, PlayerSubscription} = require('@discordjs/voice');
const { prefix, token } = require('./config.json');
const ytdl = require('ytdl-core-discord');
const queue = new Map();
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});

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

client.on('messageCreate', message => {
    const serverQueue = queue.get(message.guild.id);
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    if (message.content == prefix) {
        return message.channel.send('If you need help with anything gimme a -h after that there \'+\'.\n\'+ -h\'')
    }
    if (message.content.startsWith(`${prefix}play`)) {
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
        stop(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix} -h`)) {
        message.channel.send('you can play youtube songs via \'+play {youtube link}\'\nyou can also skip songs or stop everthing all together by typing either \'+skip\' or \'+stop\'.');
        return;
    } else {
        message.channel.send("You need to enter a valid command!");
    }
});

const stop = (message, serverQueue) => {
    if (!message.member.voice.channel){
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
          );
    }
    
  if (!serverQueue){
    return message.channel.send("There is no song that I could stop!");
  }
    
  serverQueue.songs = [];
  serverQueue.connection.destroy();
  return message.channel.send('Okay fine I\'ll shutup...');
};

const displayList = serverQueue =>{
    let separator = '\n',
        bs = '';

    serverQueue.songs.shift();
    serverQueue.songs.map((song, ind) => {
        bs+=song.title+separator
    })
    return bs;
}

const skip = (message, serverQueue) => {
    if (!message.member.voice.channel){
        return message.channel.send(
        "You have to be in a voice channel to stop music..."
        );
    }
    if (!serverQueue){
        return message.channel.send("Queue is empty bud...");
    }
    if(serverQueue.songs.length > 1){
        message.channel.send(`I agree... that song is trash. Here are the remaing track in the list\n${displayList(serverQueue)}`)
        stream(serverQueue.songs[0].url, serverQueue.connection);
    } else {
       stop(message, serverQueue);
    }
};

//Await on the opus stream and then play said resource
const stream = async (url, connection, queueContruct) =>  {
    //Init values
    const player = createAudioPlayer(),
          file = await ytdl(url),
          resource = createAudioResource(file, {
            inputType: StreamType.Opus
          });
    //actions
    player.play(resource);
    player.on(AudioPlayerStatus.Playing, () => console.log('playing audio'))
    player.on('error', err => {
        console.warn(err)
    });
    connection.subscribe(player);

    //if the queue is at its last item just end connection
    //otherwise play the next song in the queue.
    player.on(AudioPlayerStatus.Idle, () => {
        queueContruct.songs.shift();
        if(queueContruct.songs.length){
            stream(queueContruct.songs[0].url, player);
        } else {
            connection.destroy();
        }
    })
}

//large container for controlling state (waits on info for ytdl)
const execute = async (message, serverQueue) => {
    const args = message.content.split(" "),
     voiceChannel = message.member.voice.channel,
     hasArgument = args.length > 1;


    //quick checks before doing anything else...
    if(!hasArgument){
        return message.channel.send('Give me something to work with.')
    }
    if (!voiceChannel) {
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    }
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }

    //wait on the song results we get back from ytdl
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };
   
    //if this is a fresh server and there is no state established
    //or if you've previously ran the stop method  
    if (!serverQueue || serverQueue.songs.length === 0) {
        //new stuff for state mangmt...
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
           };

           // Setting the queue using our contract
           queue.set(message.guild.id, queueContruct);
           // Pushing the song to our songs array
           queueContruct.songs.push(song);
           
           //try to connect to the voice server and then stream the song
           try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator
            });
            queueContruct.connection = connection;
            stream(queueContruct.songs[0].url, connection, serverQueue);
           } catch (err) {
            // Printing the error message if the bot fails to join the voicechat
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
           }
    }else {
    //add new songs to queue
     serverQueue.songs.push(song);
     return message.channel.send(`${song.title} has been added to the queue!`);
    }
}

client.login(token);