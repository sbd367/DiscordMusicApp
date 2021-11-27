//init constants 
const {joinVoiceChannel} = require('@discordjs/voice'),
      stream = require('./playstream'),
      ytdl = require('ytdl-core-discord'),
      youtubeRequest = require('./youtube-search-api');
      require('discord.js');


//method that takes a youtube url and returns an object containing both the listID and play index.
const buildList = url => {
    const params = url.split('&'),
    listId = params.filter(param => param.includes('list='))[0].replace(/.*\=/g, ''),
    ind = params.filter(param => !!param.includes('index='))[0] ? param.includes('index=')[0].replace(/.*\=/g, '') : null;
    return {listId: listId, index: ind}
}
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
//large container for controlling state (waits on info for ytdl)
exports.runAction = async (interaction, serverQueue, queue) => {
    //capture argument
    const arg = interaction.options.getString('link'),
     voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return await interaction.reply(
        "You need to be in a voice channel to play music!"
      );
    }

    // TODO: add collector to handle user resp
    if(!arg.includes('https://')) {
        return await interaction.reply('You have to give me a youtube link')
    }

    //ensure permissions
    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return await interaction.reply(
        "I need the permissions to join and speak in your voice channel!"
      );
    }

    //if the link sent over is part of a playlist it will add the first 10 songs from that 
    //playlist into the queue.
    const playlist = arg.includes('list=') ? buildList(arg) : null,
        searchArr = arg.split(' ');
    // TODO: refactor YT api module
    if(searchArr.length){
        console.log('is a search', searchArr);
        //TODO: add search request to youtube API
        const getVideo = youtubeRequest.videoRequest(searchArr.join(' '));
        getVideo().then( songData => {
            exports.addPlaySong()
        })
        
    } else if(playlist) {
        const attachment = 'So I dont get thrown in youtube jail...\nI\'ve added (up to) 10 of those songs in that playlist to the queue';
        const info = youtubeRequest.listRequest(playlist);
        info.then(res => {
            exports.addPlaySong(arg, res);
        });
    } else {
        exports.addPlaySong(arg, null);
    }
};
exports.addPlaySong = async (startLink, songs) => {
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
            textChannel: interaction.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
        };

        // Setting the queue using our contract
        queue.set(interaction.guild.id, queueContruct);
        // Pushing the song to our songs array
        queueContruct.songs.push(song);
        if(songs){
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
            return await interaction.reply(`Currently playing: ${queueContruct.songs[0].title}`)
        } catch (err) {
            // Printing the error message if the bot fails to join the voicechat
            console.log(err);
            queue.delete(interaction.guild.id);
            return await interaction.reply(err);
        }
    }else {
        //add new songs to queue
        if(songs) queueContruct.songs = queueContruct.songs.concat(songs);
        serverQueue.songs.unshift(song);
        return await interaction.reply(`${song.title} has been added to the queue!`);
    }
}
exports.stop = async (interaction, serverQueue) => {
    //Precheck
    const signalDestroyed = serverQueue.connection._state.status === 'destroyed';
    if (!interaction.member.voice.channel || !serverQueue || signalDestroyed){
        await interaction.reply(noNeedToShowChat('Can not complete your request.\nPlease ensure you are...\n1. In a voice channel\n2. There is currently music being played to your voice channel'));
    };
    //small function to dissconect and send message
    const closeConnection = async (interaction, serverQueue) => {
        serverQueue.connection.destroy();
        return await interaction.reply('Okay, I\'ll shut up');;
    };
    //if the guild has no songs listed
    //set just destroy the connection
    //else set the queue to empty arry and destroy the connection
    if(serverQueue.songs.length === 0){
        return closeConnection(interaction, serverQueue)
    } else {
        serverQueue.songs = [];
        return closeConnection(interaction, serverQueue)
    }
};
exports.list = async (interaction, serverQueue) => {
    if(!serverQueue || serverQueue.songs == []){
        msg+='There are none';
        return await interaction.reply(noNeedToShowChat(msg));
    }
    return await interaction.reply(`Here are the remaing track's in the list:\n${displayList(serverQueue)}`)
}
exports.skip = async (interaction, serverQueue) => {
    //pre-checks
    const signalDestroyed = serverQueue.connection._state.status === 'destroyed',
        noNoConditionals = !serverQueue || 
            serverQueue.songs === [] || 
            !interaction.member.voice.channel || 
            signalDestroyed;

    if (noNoConditionals){
        msg+='Could not skip song... please ensure that:\n1. there are songs in the queue\n2. You are currently in a voice chat';
        return await interaction.reply(noNeedToShowChat(msg));
    }
    //if its not on the last song... 
    //send message and change stream to the next song in the queue.
    if(serverQueue.songs.length > 1){
        serverQueue.songs.shift();
        stream.playStream(serverQueue.songs[0].url, serverQueue.connection, serverQueue);
        return await interaction.reply(`I agree... that song is trash...\nHere are the remaing track's in the list:\n${displayList(serverQueue)}`)
    } else {
       return await exports.stop(message, serverQueue);
    }
};