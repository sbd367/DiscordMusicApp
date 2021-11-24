const {joinVoiceChannel} = require('@discordjs/voice');
const stream = require('./playstream');
const ytdl = require('ytdl-core-discord');

//function used to build a list of current songs
const displayList = serverQueue =>{
    //shows the list of songs in the queue
    let separator = '\n',
        bs = '';

    //don't show the curent result and build string to display to user
    serverQueue.songs.shift();
    serverQueue.songs.map((song, ind) => {
        bs+=song.title+separator
    })
    // return the built string
    return bs;
}
//large container for controlling state (waits on info for ytdl)
exports.runAction = async (message, serverQueue, queue) => {
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

    //ensure permissions
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
            stream.playStream(queueContruct.songs[0].url, connection, queueContruct);
           } catch (err) {
            // Printing the error message if the bot fails to join the voicechat
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
           }
    }else {
        console.log('server Q', serverQueue.songs)
        //add new songs to queue
        serverQueue.songs.push(song);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }
};
exports.stop = (message, serverQueue) => {
    //Precheck
    if (!message.member.voice.channel){
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
          );
    }
    
    if (!serverQueue){
        return message.channel.send("There is no song that I could stop!");
    }

    //set the queue to null then destroy the connection
    serverQueue.songs = [];
    serverQueue.connection.destroy();
    return message.channel.send('Okay fine I\'ll shutup...');
};
exports.skip = (message, serverQueue) => {
    //pre-checks
    if (!message.member.voice.channel){
        return message.channel.send(
        "You have to be in a voice channel to stop music..."
        );
    }
    if (!serverQueue){
        return message.channel.send("Queue is empty bud...");
    }

    //if its not on the last song... 
    //send message and change stream to the next song in the queue.
    if(serverQueue.songs.length > 1){
        message.channel.send(`I agree... that song is trash. Here are the remaing track in the list\n${displayList(serverQueue)}`)
        stream.playStream(serverQueue.songs[0].url, serverQueue.connection, serverQueue);
    } else {
       stop(message, serverQueue);
    }
};