//bring in libraries and get things all ready n stuff...
require('dotenv').config();
const { Client, Intents } = require('discord.js'),
    { nouns, adjectives } = require('./assets/staticData'),
    execute = require('./components/execute'),
    cron = require('cron'),
    // player = require('./Components/player'), //TODO
    cmds = require('./actions/commands'),
    queue = new Map(),
    client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_VOICE_STATES
        ]
    });

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
    guild = client.guilds.cache.get(gId),
    commands = guild ? guild?.commands : client?.commands;

    cmds.commands.forEach(command => {
        commands.create(command);
    });

    console.log('runs');
    // Setting the queue using our contract
    return queue.set(interaction.guild.id, queueContruct);
};

//log different status levels
client.once('ready', () => {
    //TODO: add greeting message to set state
    let conditions = (channel) => {
        console.log(channel.filter(chan => chan.type == 'GUILD_TEXT' && chan.rawPosition === 0))
    }
    let generalChannel = client.channels.cache.find(channel => channel.name == 'thegeneral');
    conditions(client.channels.cache);
    let sheduleMessage = new cron.CronJob('44 15 * * *', () => {
        execute.useNASA(generalChannel);
    })
    sheduleMessage.start();
    console.log('-----------We\'re good to go---------------')
});
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('interactionCreate', async (interaction) => {

    if(interaction.isSelectMenu()){
        console.log(interaction.values);
        let serverQueue = queue.get(interaction.guild.id);
        if(interaction.values.length){
            const val = interaction.values[0];
            if(serverQueue.songs.length){
                interaction.update({content: `Now Playing: ${serverQueue.songs[val].title}`, components: []})
                return await execute.playFromList(serverQueue, val);
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
        const nounRandomNumber = Math.floor(Math.random() * (nouns.length - 1)),
            adjRandomNumber = Math.floor(Math.random() * (adjectives.length - 1)),
            adjRandomNumber1 = Math.floor(Math.random() * (adjectives.length - 1)),
            noun = nouns[nounRandomNumber],
            adjective = adjectives[adjRandomNumber],
            adjective1 = adjectives[adjRandomNumber1];
        return await interaction.reply(`fuck you tyche... you ${adjective}, ${adjective1}, ${noun}.`)
    }
    //++++++++END BAN TYCHE+++++++++++++

    //Setup variables required for interactions in general.
    let serverQueue = queue.get(interaction.guild.id), //Adds the current guild ( discord server ) state to our map.
        { commandName, member } = interaction, //pull the commmandName from the interaction.
        voiceChannel = member.voice.channel, //capture voice channel
        checkFor = action => commandName.includes(action), //simple method - used when responding.
        msg = ''; //Build string

    if (!interaction.isCommand()) return //needs to be a command.

    //if serverQueue.songs is undefined, initialize connection and add it to our state.
    if (!serverQueue || !serverQueue.songs) {
        await setupState(serverQueue, voiceChannel, interaction);
        serverQueue = queue.get(interaction.guild.id);
    }

    if (checkFor('weather')){
        return await execute.useWeather(interaction, serverQueue);
    }

    //member needs to be in a voice channel
    if (!voiceChannel) {
        return await interaction.reply(
            "You need to be in a voice channel to play music!"
        );
    }

    //handle actions for each command - reply handled in module by default 
    if (checkFor('play')) {
        return await execute.runAction(interaction, serverQueue, voiceChannel); // See: https://github.com/sbd367/DiscordMusicApp/blob/master/Components/execute.js#L15
    } else if (checkFor('list')) {
        return await execute.list(interaction, serverQueue);
    } else if (checkFor('skip')) {
        return await execute.skip(interaction, serverQueue);
    } else if (checkFor('stop')) {
        return await execute.stop(interaction, serverQueue);
    } else if (checkFor(' -h')) {
        msg += 'you can play youtube songs via \'+play {youtube link}\'\nyou can also skip songs or stop everthing all together by typing either \'+skip\' or \'+stop\'.';
        return await interaction.reply(noNeedToShowChat(msg));
    } else {
        msg += 'You need to enter a valid command! - type \'+ -h\''
        return await interaction.reply(noNeedToShowChat(msg));
    }
    //todo: add in player component
    // if(checkFor('player')){
    //     return await player.startUp(interaction, serverQueue)
    // }

});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    let serverQueue = queue.get(message.guild.id)
    if (!serverQueue || !serverQueue.songs) {
        let {  member } = message, //pull the commmandName from the interaction.
        voiceChannel = member.voice.channel;
        await setupState(serverQueue, voiceChannel, message);
        serverQueue = queue.get(message.guild.id);
    }
    const nounRandomNumber = Math.floor(Math.random() * (nouns.length - 1)),
        adjRandomNumber = Math.floor(Math.random() * (adjectives.length - 1)),
        noun = nouns[nounRandomNumber],
        adjective = adjectives[adjRandomNumber],
        condition = message.content[0] === '+';
    return condition ? await message.reply({ content: `Messages are depricated, use slash commands instead... you ${adjective} ${noun}`}) : null;
});

client.login(process.env.DISCORD_TOKEN);