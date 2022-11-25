const { StreamType } = require('@discordjs/voice');
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js'),
stream = require('./playstream');
//function used to build a list of current songs - ALL OF THIS IS TO BE DEPRICATED
exports.displayList = serverQueue =>{
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

exports.addSong = async (song, serverQueue, songs = null, interaction, hasAlreadyCalledYouTube) => {
    //Currently this gets hit everytime we call youtube api... this doesnt need to happen.
    if(!hasAlreadyCalledYouTube && typeof(song) === 'string' && song.includes('youtube.com/')){
        //wait on the song results we get back from ytdl
        const songInfo = await ytdl.getInfo(song);
        // console.log(songInfo)
        song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
            thumbnail: songInfo.thumbnail_url
        };
    }

    //Handle weather or not these are playlist results - respond
    if(songs){
        serverQueue.songs = serverQueue.songs.concat(songs);
        interaction.reply({content: 'I\'ll go ahead and get those added for ya.', embeds: [await this.baseMessageEmbed('playlist', serverQueue.songs)], ephemeral: true});
    } else {
        serverQueue.songs.push(song);
        interaction.editReply({content: `Alright, I've added ${song.title} to the queue.`, embeds: [await this.baseMessageEmbed('single', song)], ephemeral: true});
    }

    //if this is the first song getting added to the playlist then start the stream
    let newSong = serverQueue.songs[0];
    if(serverQueue.songs.length === 1){
        console.log('first song');
        await stream.playStream(newSong.url, serverQueue);
    }
}

//data will be... customId, placeHolder. 
exports.selection = (serverQueue, data) => {
    let row = new MessageActionRow(),
    selectEl = new MessageSelectMenu()
        .setCustomId(data.customId)
        .setPlaceholder(data.placeHolder);
    let bArr = [];
    serverQueue.songs.forEach((el, ind) => {
        let bObj = {}
        bObj.label = el.title; bObj.description = 'Click to play'; bObj.value = String(ind);
        bArr.push(bObj);
    });
    row.addComponents(
        selectEl.addOptions(bArr)
    );
    return row;
}

//Builder method for message responses
exports.baseMessageEmbed = async (type, data) =>{
    let {title, url, thumbnail} = data,
        embed = new MessageEmbed();
    if(type === 'playlist'){
        data.forEach((el, ind) => {
            let {title, url, thumbnail} = el;
            //handle song embed logic
            ind === 0 ? embed.setColor('DARKER_GREY').setTitle(`Current Queue:`).setAuthor({name: `Now playing: ${title}`, iconURL: thumbnail.url}) :
                        embed.addField(title, url);
        });
        return embed;

    } else if (type === 'single'){
        embed.setColor('DARKER_GREY')
            .setTitle(title)
            .setURL(url)
            .setImage(thumbnail.url)
            console.log(embed)
        return embed;
    }
};

//only display to the user
exports.noNeedToShowChat = content => {
    return {content: content, ephemeral: true}
} 