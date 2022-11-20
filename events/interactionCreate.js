//setup constants 
const execute = require('../components/execute'), queue = new Map(), {Client} = require('discord.js'), cmds = require('../actions/commands');

const setupState = (serverQueue, voiceChannel, interaction) => {
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

module.exports = {
    name: 'interactionCreate',
    once: false,
    execute(interaction) {
        if(interaction.isSelectMenu()){
        let serverQueue = queue.get(interaction.guild.id);
        if(interaction.values.length){
            const val = interaction.values[0];
            if(serverQueue.songs.length){
                interaction.update({content: `Now Playing: ${serverQueue.songs[val].title}`, components: []})
                return execute.playFromList(serverQueue, val);
            } else {
                interaction.reply({content: 'No songs to play'})
            }
        }

    }
    const noNeedToShowChat = content => {
        return { content: content, ephemeral: true }
    };
    //++++++BAN TYCHE+++++
    if (interaction.user.id === process.env.BANNED_TYCHE) {
        console.log('banning tyche');
        const nounRandomNumber = Math.floor(Math.random() * (nouns.length - 1)),
            adjRandomNumber = Math.floor(Math.random() * (adjectives.length - 1)),
            adjRandomNumber1 = Math.floor(Math.random() * (adjectives.length - 1)),
            noun = nouns[nounRandomNumber],
            adjective = adjectives[adjRandomNumber],
            adjective1 = adjectives[adjRandomNumber1];
        return interaction.reply(`You dont get to use this tyche... you ${adjective}, ${adjective1}, ${noun}.`)
    }
    //++++++++END BAN TYCHE+++++++++++++

    //Setup variables required for interactions in general.
    let serverQueue = queue.get(interaction.guild.id), //Adds the current guild ( discord server ) state to our map.
        { commandName, member } = interaction, //pull the commmandName from the interaction.
        voiceChannel = member.voice.channel, //capture voice channel
        checkFor = action => commandName.includes(action), //simple method - used when responding.
        msg = ''; //Build string - for simple responses 

    if (!interaction.isCommand()) return //needs to be a command.

    //if serverQueue.songs is undefined, initialize connection and add it to our state.
    if (!serverQueue || !serverQueue.songs) {
        setupState(serverQueue, voiceChannel, interaction);
        serverQueue = queue.get(interaction.guild.id);
    }

    if (checkFor('weather')){
        return execute.useWeather(interaction, serverQueue);
    }

    //member needs to be in a voice channel
    if (!voiceChannel) {
        return interaction.reply(
            "You need to be in a voice channel to play music!"
        );
    }

    //handle actions for each command - reply handled in module by default 
    if (checkFor('play')) {
        return execute.runAction(interaction, serverQueue, voiceChannel); 
    } else if (checkFor('list')) {
        return execute.list(interaction, serverQueue);
    } else if (checkFor('mood')) {
        return execute.mood(interaction, serverQueue, voiceChannel);
    } else if (checkFor('skip')) {
        return execute.skip(interaction, serverQueue);
    } else if (checkFor('stop')) {
        return execute.stop(interaction, serverQueue);
    } else if (checkFor('help')) {
        msg += 'you can play youtube songs via \'+play {youtube link}\'\nyou can also skip songs or stop everthing all together by typing either \'+skip\' or \'+stop\'.';
        return interaction.reply(noNeedToShowChat(msg));
    } else {
        msg += 'You need to enter a valid command! - type \'+ -h\''
        return interaction.reply(noNeedToShowChat(msg));
    }
    //todo: add in player component
    // if(checkFor('player')){
    //     return await player.startUp(interaction, serverQueue)
    // }
    }
}