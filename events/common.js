let cmds = require('../actions/commands'), {queue} = require('../state/songQueue');
exports.setupState = (serverQueue, voiceChannel, interaction) => {
    //new stuff for state mangmt...
    const queueContruct = {
        textChannel: serverQueue ? serverQueue.textChannel : null,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 4,
        playing: false,
    }, 
    gId = interaction.guild.id,
    guild = interaction.guild,
    commands = guild ? guild?.commands : Client?.commands;

    cmds.commands.forEach(command => {
        commands.create(command);
    });

    console.log('Setup state:', queueContruct);
    // Setting the queue using our contract
    return queue.set(interaction.guild.id, queueContruct);
};

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
        return embed.setColor('DARKER_GREY')
            .setTitle(title)
            .setURL(url)
            .setImage(thumbnail.url)
    };
};