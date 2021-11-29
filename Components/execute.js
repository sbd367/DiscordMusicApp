//init constants 
const {joinVoiceChannel} = require('@discordjs/voice'),
      stream = require('./playstream'),
      ytdl = require('ytdl-core-discord'),
      youtubeRequest = require('./youtube-search-api');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
      require('discord.js');


//method that takes a youtube url and returns an object containing both the listID and play index.
const buildList = url => {
    const params = url.split('&'),
        listId = params.filter(param =>!!param.includes('list=')),
        ind = params.filter(param => !!param.includes('index=')),
        //note of there is no id found in the url then that video is the first in the playlist.
        bObj = {
            listId: listId ? listId[0].replace(/.*list=/g, ''): null,
            ind: !!ind.length ? ind[0].replace(/.*index=/g, '') : null
        };
        return bObj;
}

//only display to the user
const noNeedToShowChat = content => {
    return {content: content, ephemeral: true}
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
    const voiceChannel = interaction.member.voice.channel;
    const arg = interaction.options.getString('search') ? interaction.options.getString('search') : '';

    if (!voiceChannel) {
    return await interaction.reply(
        "You need to be in a voice channel to play music!"
    );
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
    //rub search and play song
    if(searchArr.length > 1){
        const searchString = searchArr.join(' ');
        youtubeRequest.videoRequest(searchString).then( songData => {
            return exports.addPlaySong(songData, null, serverQueue, voiceChannel, queue, interaction)
        });
    //handle playlist logiic
    } else if(playlist) {

        const row = new MessageActionRow()
            .addComponents(
            new MessageButton()
                .setCustomId(arg)
                .setLabel('add All of them')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('noThanks')
                .setLabel('No Thanks')
                .setStyle('PRIMARY')
            ),
            embed = new MessageEmbed()
            .setColor('DARKER_GREY')
            .setTitle('Playlist')
            .setURL(`https://www.youtube.com/playlist?list=${playlist.listId}`);

        const msg = 'So I dont get thrown in youtube jail...\n'+
        'If you\'d like I can add (up to) 10 of those songs in that playlist to the queue\n'+
        'just respond "yes" to add the items... otherwise go kick sand.';

        await interaction.reply({content: msg, ephemeral: true, embeds: [embed], components: [row], fetchReply: true}).then(() => {
            interaction.channel.awaitMessageComponent({ max: 1, time: 30000, errors: ['time'] }).then((option) => {
                if(option.customId === 'noThanks'){
                    interaction.followUp({content: 'Okay I\'ll just add that one song...', ephemeral: true});
                    return exports.addPlaySong(arg, null, serverQueue, voiceChannel, queue, interaction, true);
                } else if (option.customId.includes('youtube.com')){
                    const params = buildList(option.customId);
                    youtubeRequest.listRequest(params).then(resp => {
                        interaction.followUp({content: 'Okay I\'ll add that playlist to the queue', ephemeral: true});
                        return exports.addPlaySong(arg, resp, serverQueue, voiceChannel, queue, interaction, true);
                    })
                }
            }).catch(err => {
                console.log(`ran out of time: ${err}`)
            })
        })
    }
};

//awaits on ytdl for info
exports.addPlaySong = async (startLink, songs, serverQueue, voiceChannel, queue, interaction, isFollowup = false ) => {

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
            textChannel: serverQueue ? serverQueue.textChannel : null,
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
            return isFollowup ? 
                interaction.followUp(noNeedToShowChat(`Currently playing: ${queueContruct.songs[0].title}\n New queue: ${displayList(queueContruct)}`)) : 
                interaction.reply(noNeedToShowChat(`Currently playing: ${queueContruct.songs[0].title}`));
        } catch (err) {
            // Printing the error message if the bot fails to join the voicechat
            console.warn('ERROR:', err);
            queue.delete(interaction.guild.id);
            return await interaction.reply(err);
        }
    } else {
        //add new songs to queue
        if(songs) queueContruct.songs = queueContruct.songs.push(songs);
        serverQueue.songs.push(song);
        return await interaction.reply(`${song.title} has been added to the queue!`);
    }
}
exports.stop = async (interaction, serverQueue) => {
    //Precheck
    if (!interaction.member.voice.channel || !serverQueue || serverQueue.connection._state.status === 'destroyed'){
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
        return interaction.reply(noNeedToShowChat('There are none'));
    }
    return interaction.reply(`Here are the remaing track's in the list:\n${displayList(serverQueue)}`)
}
exports.skip = async (interaction, serverQueue) => {
    //pre-checks
    const noNoConditionals = !serverQueue || 
        serverQueue.songs === [] || 
        !interaction.member.voice.channel

    if (noNoConditionals){
        return await interaction.reply({
            content: noNeedToShowChat('Could not skip song... please ensure that:\n1. there are songs in the queue\n2. You are currently in a voice chat'), 
            ephemeral: true
        });
    }
    //if its not on the last song... 
    //send message and change stream to the next song in the queue.
    if(serverQueue.songs.length > 1){
        serverQueue.songs.shift();
        stream.playStream(serverQueue.songs[0].url, serverQueue.connection, serverQueue);
        return await interaction.reply({
            content: `I agree... that song is trash...\nHere are the remaing track's in the list:\n${displayList(serverQueue)}`,
            ephemeral: true
        });
    } else {
       return await exports.stop(interaction, serverQueue);
    }
};