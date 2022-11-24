//setup constants 
const execute = require('../components/execute'), {Client} = require('discord.js'), 
    cmds = require('../actions/commands');
const {setupState} = require('./common');
let {queue} = require('../state/songQueue');

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
    const {commands} = require('../actions/commands');
    for(let cmdInd in commands){
        let curCommand = commands[cmdInd],
            checkCmd = checkFor(curCommand.name);
        if(checkCmd){
            let commandName = curCommand.name;
            console.log(commandName)
            return execute[commandName](interaction, serverQueue, voiceChannel);
        };
    };

    //todo: add in player component
    // if(checkFor('player')){
    //     return await player.startUp(interaction, serverQueue)
    // }
    }
}