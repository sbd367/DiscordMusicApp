const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');
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
    console.log(data)
    if(type === 'playlist'){
        data.forEach((el, ind) => {
            let {title, url, thumbnail} = el;
            //handle song embed logic
            ind === 0 ? embed.setColor('DARKER_GREY').setTitle(`Current Queue:`).setAuthor({name: `Now playing: ${title}`, iconURL: thumbnail.url}) :
                        embed.addField(title, url);
        });
        return embed;

    } else if (type === 'single'){
        return embed.setColor('DARKER_GREY')
            .setTitle(title)
            .setURL(url)
            .setImage(thumbnail.url)
    }
};

//only display to the user
exports.noNeedToShowChat = content => {
    return {content: content, ephemeral: true}
} 