//init constants 
const {joinVoiceChannel} = require('@discordjs/voice'),
      stream = require('./playstream'),
      weatherService = require('./weather-api-service'),
      ytdl = require('discord-ytdl-core'),
      youtubeRequest = require('./youtube-search-api'),
    { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');
      require('discord.js');


//method that takes a youtube url and returns an object containing both the listID and play index.
const buildList = url => {
    const params = url.split('&'),
        listId = params.filter(param =>!!param.includes('list=')),
        ind = params.filter(param => !!param.includes('index=')),
        //note of there is no id found in the url then that video is the first in the playlist.
        bObj = {
            listId: listId ? listId[0].replace(/.*list=/g, ''): null,
            ind: !!ind.length ? ind[0].replace(/.*index=/g, '') : null,
            isFirstItem: !ind.length
        };
    return bObj;
}

//only display to the user
const noNeedToShowChat = content => {
    return {content: content, ephemeral: true}
}

//function used to build a list of current songs - ALL OF THIS IS TO BE DEPRICATED 
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

//large container for controlling state 
//NOTE: the interaction messages are to be defferred outside of this method besides initalization of the interaction reply
//      followups should be handled in their respective modules, based off of its scoped state (serverQueue, interaction status).
exports.runAction = async (interaction, serverQueue, voiceChannel) => {
    //ensure permissions
    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return await interaction.reply(
            "I need the permissions to join and speak in your voice channel!"
        );
    }
    //update the user that we're looking into it
    
    if(!serverQueue.songs.length || !serverQueue.connection){
       await this.joinTheChannel(voiceChannel, serverQueue, interaction)
    }

    // - Setup `arg` to see what kind of search this is: (regular/playlist link, keyword search)
    //if the link sent over is part of a playlist it will add the first 10 songs from that 
    //playlist into the queue.
    const arg = interaction.options.getString('search') ? interaction.options.getString('search') : '',
         playlist = arg.includes('list=') ? buildList(arg) : null,
         searchArr = arg.split(' '),
         addNewSong = async (song, serverQueue, songs = null, interaction = interaction, hasAlreadyCalledYouTube) => await this.addSong(song, serverQueue, songs, interaction, hasAlreadyCalledYouTube);

    //run search and play song
    if(searchArr.length > 1 || !searchArr[0].includes('youtube.com/')){
        console.log(interaction)
        interaction.reply({content: 'Working on that for you...', ephemeral: true})
        const searchString = searchArr.join(' '),
            newSongData = await youtubeRequest.videoRequest(searchString);
        //add new songs to the queue
        await addNewSong(newSongData, serverQueue, null, interaction, true);
        let newSong = serverQueue.songs[0];
        //if there's more than one song already in the queue just add the song else start playstream
        serverQueue.songs.length === 1 ? stream.playStream(newSong.url, serverQueue) : null;
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
        

        return interaction.reply({content: msg, embeds: [embed], components: [row], fetchReply: true}).then(async () => {
            await interaction.channel.awaitMessageComponent({ max: 1, time: 30000, errors: ['time'] }).then(async (option) => {
                if(option.customId === 'noThanks'){
                    await addNewSong(arg, serverQueue, null, interaction, false);
                    if(serverQueue.songs.length === 1) await stream.playStream(newSong.url, serverQueue);
                    option.update([])
                } else if (option.customId.includes('youtube.com')){
                    const params = buildList(option.customId),
                        initialQueue = serverQueue.songs.length,
                        newSongs = await youtubeRequest.listRequest(params);
                    await addNewSong(arg, serverQueue, newSongs, interaction, true);
                    let newSong = serverQueue.songs[0];
                    if(initialQueue === 0) await stream.playStream(newSong.url, serverQueue);
                }
                return option.update({components: []});
            }).catch(err => {
                interaction.editReply({content: 'I made a whoops', ephemeral: true});
                console.log(`ran out of time: ${err}`)
            })
        }).catch(err => {
            console.warn('error from initial reply', err)
        })
    } else if(searchArr[0].includes('youtube.com/')){
        await addNewSong(searchArr[0], serverQueue, null, false);
        let newSong = serverQueue.songs[0];
        //if there's more than one song already in the queue just add the song else start playstream
        serverQueue.songs.length === 1 ? stream.playStream(newSong.url, serverQueue) : null;
    }
};

exports.joinTheChannel = async (voiceChannel, serverQueue, interaction) => {
    // try to connect to the voice server and then stream the song
    try {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });
        serverQueue.connection = connection;
    } catch (err) {
        // Printing the error message if the bot fails to join the voicechat
        console.warn('ERROR:', err);
        return await interaction.reply(err);
    }
}

exports.useWeather = async (interaction, serverQueue) => {
    const zip = interaction.options.getString('zipcode'),
    weatherData = await weatherService.getByZipCode(zip);
    embed = new MessageEmbed()
        .setColor('DARKER_GREY')
        .setTitle(`Current Temp: ${weatherData.actual_temp} °F\nFeels like: ${weatherData.feels_like} °F\nHumidity: ${weatherData.humidity}%\nUV index: ${weatherData.uv_ind}`)
        .setAuthor(`It's currently: ${weatherData.condition.type}`, `https:${weatherData.condition.icon}`);
    interaction.reply({content:`Here's the current weather info for ${weatherData.location.place}, ${weatherData.location.state}`, embeds:[embed]})
}

exports.addSong = async (song, serverQueue, songs = null, interaction, hasAlreadyCalledYouTube) => {
    //Currently this gets hit everytime we call youtube api... this doesnt need to happen.
    if(!hasAlreadyCalledYouTube && typeof(song) === 'string' && song.includes('youtube.com/')){
        //wait on the song results we get back from ytdl
        const songInfo = await ytdl.getInfo(song);
        console.log(songInfo)
        song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
        };
    }

    const baseMessageEmbed = async (type, data) =>{
        let {title, url, thumbnail} = data,
            embed = new MessageEmbed();

        if(type === 'playlist'){
            data.forEach((el, ind) => {
                let {title, url, thumbnail} = el;
                //handle song embed logic
                ind === 0 ? embed.setColor('DARKER_GREY').setTitle(`Current Queue:`).setAuthor(`Now playing: ${title}`, thumbnail.url) :
                            embed.addField(title, url);
            })
            return embed;

        } else if (type === 'single'){
            return embed.setColor('DARKER_GREY')
                .setTitle(title)
                .setURL(url)
                .setImage(thumbnail.url)
        }
    };

    //Handle weather or not these are playlist results
    if(songs){
        serverQueue.songs = serverQueue.songs.concat(songs);
        interaction.editReply({content: 'I\'ll go ahead and get those added for ya.', embeds: [await baseMessageEmbed('playlist', serverQueue.songs)], ephemeral: true});
    } else {
        serverQueue.songs.push(song);
        interaction.editReply({content: `Alright, I've added ${song.title} to the queue.`, embeds:[await baseMessageEmbed('single', song)], ephemeral: true});
    }

    //if this is the first song getting added to the playlist then start the stream
    let newSong = serverQueue.songs[0];
    if(serverQueue.songs.length === 1){
        await stream.playStream(newSong.url, serverQueue);
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
    //just destroy the connection.
    //else set the queue to empty arry and destroy the connection
    if(serverQueue.songs.length === 0){
        return closeConnection(interaction, serverQueue)
    } else {
        serverQueue.songs = [];
        return closeConnection(interaction, serverQueue)
    }
};
exports.list = async (interaction, serverQueue) => {
    let row = new MessageActionRow(),
        selectEl = new MessageSelectMenu()
        .setCustomId('list-select')
        .setPlaceholder('Pick a song...');

    if(!serverQueue.songs.length){
        row.addComponents(
            new MessageButton()
            .setCustomId('random search')
            .setLabel('Make a random search')
            .setStyle('PRIMARY')
        )
        return interaction.reply({content: 'Looks like there isn\'t anything in here...', components: [row]});
    } else {
        let bArr = [];
        serverQueue.songs.forEach((el, ind) => {
            let bObj = {}
            bObj.label = el.title; bObj.description = 'Click to play'; bObj.value = String(ind);
            bArr.push(bObj);
        });

        row.addComponents(
            selectEl.addOptions(bArr)
        );

        console.log(row);
        return interaction.reply({content: `Here are the remaing track's in the list:`, components: [row]})
    }
}
exports.skip = async (interaction, serverQueue) => {
    //pre-checks
    const noNoConditionals = !serverQueue || 
        serverQueue.songs === [] || 
        !interaction.member.voice.channel

    if (noNoConditionals){
        return await interaction.reply(noNeedToShowChat('Could not skip song... please ensure that:\n1. there are songs in the queue\n2. You are currently in a voice chat'));
    }
    //if its not on the last song... 
    //send message and change stream to the next song in the queue.
    if(serverQueue.songs.length > 1){
        serverQueue.songs.shift();
        stream.playStream(serverQueue.songs[0].url, serverQueue);
        return await interaction.reply({
            content: `I agree... that song is trash...\nHere are the remaing track's in the list:`, 
            embeds: [await baseMessageEmbed(serverQueue.songs, 'playlist')],
            ephemeral: true
        });
    } else {
       return await exports.stop(interaction, serverQueue);
    }
};