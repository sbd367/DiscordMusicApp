//bring in libraries and get things all ready n stuff...
require('dotenv').config();
const {Client, Intents, ThreadChannel} = require('discord.js'),
      { token, prefix } = require('./config.json'),
      {nouns, adjectives} = require('./assets/staticData'),
      execute = require('./Components/execute'),
      player = require('./Components/player'),
      cmds = require('./actions/commands'),
      queue = new Map(),
      client = new Client({intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS, 
        Intents.FLAGS.GUILD_MESSAGES, 
        Intents.FLAGS.GUILD_VOICE_STATES
    ]});

const noNeedToShowChat = content => {
    return {content: content, ephemeral: true}
}
//log different status levels
client.once('ready', () => {
    const gId = process.env.GUILD_ID,
        guild = client.guilds.cache.get(gId);
    
    let commands = guild ? guild.commands : client?.commands;
    cmds.commands.forEach(command => {
        commands.create(command);
    });
    console.log('-----------We\'re good to go---------------')
});
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('interactionCreate', async (interaction) => {
    //++++++BAN TYCHE+++++
    if(interaction.user.id === process.env.BANNED_TYCHE){
        const nounRandomNumber = Math.floor(Math.random() * nouns.length),
        adjRandomNumber = Math.floor(Math.random() * adjectives.length),
        adjRandomNumber1 = Math.floor(Math.random() * adjectives.length),
        noun = nouns[nounRandomNumber],
        adjective = adjectives[adjRandomNumber],
        adjective1 = adjectives[adjRandomNumber1];
        return await interaction.reply(`fuck you tyche... you ${adjective}, ${adjective1}, ${noun}.`)
    }
    //++++++++END BAN TYCHE+++++++++++++

    //Setup variables required for interactions in general.
    let serverQueue = queue.get(interaction.guild.id), //Adds the current guild state to our map.
        {commandName} = interaction, //pull both the commmandName from the interaction.
        voiceChannel = interaction.member.voice.channel, //capture voice channel
        checkFor = action => commandName.includes(action), //sinple method to serch for content actions.
        msg =''; //Build string //pull both the commmandName from the interaction.
        if(!interaction.isCommand()) return

    //member needs to be in a voice channel
    if (!voiceChannel) {
        return await interaction.reply(
            "You need to be in a voice channel to play music!"
        );
    }

    //if serverQueue songs are undefined, initialize connection and add it to our state.
    if (!serverQueue || !serverQueue.songs) {
        //new stuff for state mangmt...
        const queueContruct = {
            textChannel: serverQueue ? serverQueue.textChannel : null,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 4,
            playing: false,
        };
        console.log('server q', serverQueue)
        // Setting the queue using our contract
        queue.set(interaction.guild.id, queueContruct);
        serverQueue = queueContruct;
    }
    //todo: add in player component
    // if(checkFor('player')){
    //     return await player.startUp(interaction, serverQueue)
    // }

    //handle actions for each command - reply handled in module by default 
    if (checkFor('play')) {
        return await execute.runAction(interaction, serverQueue, voiceChannel); // See: https://github.com/sbd367/DiscordMusicApp/blob/master/Components/execute.js#L15
    } else if(checkFor('list')) {
        return await execute.list(interaction, serverQueue);
    } else if (checkFor('skip')) {
        return await execute.skip(interaction, serverQueue);
    } else if (checkFor('stop')) {
        return await execute.stop(interaction, serverQueue);
    } else if (checkFor(' -h')) {
        msg+='you can play youtube songs via \'+play {youtube link}\'\nyou can also skip songs or stop everthing all together by typing either \'+skip\' or \'+stop\'.';
        return await interaction.reply(noNeedToShowChat(msg));
    } else {
        msg+='You need to enter a valid command! - type \'+ -h\''
        return await interaction.reply(noNeedToShowChat(msg));
    }

});

client.on('messageCreate', async (message) => {
    if(message.author.bot) return;
    const nounRandomNumber = Math.floor(Math.random() * nouns.length),
        adjRandomNumber = Math.floor(Math.random() * adjectives.length),
        noun = nouns[nounRandomNumber],
        adjective = adjectives[adjRandomNumber],
        condition = message.content[0] === prefix;
    condition ? await message.reply({content: `messages are depricated, use slash commands instead... you ${adjective} ${noun}`, ephemeral: true}) : null;
    return;
});

client.login(token);