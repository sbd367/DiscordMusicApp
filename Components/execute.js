const {joinVoiceChannel} = require('@discordjs/voice'),
      stream = require('./playstream'),
      ytdl = require('ytdl-core-discord'),
      youtubeLists = require('./getListInfo');
      require('discord.js');

const buildList = url => {
    const params = url.split('&'),
    listId = params.filter(param => param.includes('list='))[0].replace(/.*\=/g, ''),
    ind = params.filter(param => param.includes('index='))[0].replace(/.*\=/g, '');
    return {listId: listId, index: ind}
}

//large container for controlling state (waits on info for ytdl)
exports.runAction = (message, serverQueue, queue) => {
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
    if(!args[1].includes('https')) {
        return message.channel.send('You have to give me a youtube link')
    }

    //ensure permissions
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }

    //if the link sent over is part of a playlist it will add the first 10 songs from that 
    //playlist into the queue.
    const playlist = args[1].includes('list=') ? buildList(args[1]) : null;
    if(playlist) {
        const attachment = 'So I dont get thrown in youtube jail...\nI\'ve added (up to) 10 of those songs in that playlist to the queue'
        message.channel.send(attachment);
        const info = youtubeLists.youTubeReq(playlist);
        info.then(res => {
            console.log(res)
            addPlaySong(args[1], res);
        });
    } else {
        addPlaySong(args[1], null);
    }

    //wait on the song results we get back from ytdl
    const addPlaySong = async (startLink, songs) => {
        //wait on the song results we get back from ytdl
        const songInfo = await ytdl.getInfo(startLink);
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
            if(songs.length){
                queueContruct.songs = queueContruct.songs.concat(songs);
            }
            
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
            //add new songs to queue
            if(songs){
                queueContruct.songs = queueContruct.songs.concat(songs);
            }
            serverQueue.songs.unshift(song);
            return message.channel.send(`${song.title} has been added to the queue!`);
        }
    }
};
exports.stop = (message, serverQueue) => {
    //Precheck
    if (!message.member.voice.channel){
        return 'not-in-vc'
    }
    if (!serverQueue){
        return 'no-tracks';
    }
    
    //small function to dissconect and send message
    const closeConnection = (message, serverQueue) => {
        serverQueue.connection.destroy();
        return 'stopped';
    };

    const signalDestroyed = serverQueue.connection._state.status === 'destroyed';
    if(signalDestroyed){
        return 'serv-prev-disc';
    }

    //if the server still has songs in the queue 
    //set the queue to empty arry then destroy the connection
    //else just destroy the connection
    if(serverQueue.songs.length === 0){
        return closeConnection(message, serverQueue)
    } else {
        serverQueue.songs = [];
        return closeConnection(message, serverQueue)
    }
};
exports.skip = (message, serverQueue) => {
    let contract = {
        state: null,
        newServerQueue: serverQueue
    }
    //pre-checks
    if (!message.member.voice.channel){
        return contract.state = 'not-in-vc';
    }
    if (!serverQueue || serverQueue.songs === []){
        return contract.state = 'empty-queue';
    }
    const signalDestroyed = serverQueue.connection._state.status === 'destroyed';
    if(signalDestroyed){
        return contract.state = 'empty-queue';
    }
    //if its not on the last song... 
    //send message and change stream to the next song in the queue.
    if(serverQueue.songs.length > 1){
        serverQueue.songs.shift();
        stream.playStream(serverQueue.songs[0].url, serverQueue.connection, serverQueue);
    } else {
       exports.stop(message, serverQueue);
    }

    contract.state = 'skipped';
    contract.newServerQueue = serverQueue;
    return contract;
};