//bring in libraries and get things all ready n stuff...
require('dotenv').config();
const {Client, Intents} = require('discord.js'),
      { token } = require('./config.json'),
      execute = require('./Components/execute'),
      cmds = require('./actions/commands'),
      queue = new Map(),
      client = new Client({intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS, 
        Intents.FLAGS.GUILD_MESSAGES, 
        Intents.FLAGS.GUILD_VOICE_STATES
    ]});

const noNeedToShowChat = content => {
    return {content: content, ephemeral: true}
}
//log different status levels
client.once('ready', () => {
    console.log('ready state')
    const gId = process.env.GUILD_ID,
        guild = client.guilds.cache.get(gId);
    let commands = guild ? guild.commands : client?.commands
    cmds.commands(commands);
});
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('interactionCreate', async (interaction) => {
    console.log('interaction')
    if(!interaction.isCommand()) return;

    let serverQueue = queue.get(interaction.guild.id), //Adds the current guild state to our map.
        checkFor = action => commandName.includes(action), //sinple method to serch for content actions.
        msg ='', //Build string
        {commandName} = interaction; //pull both the commmandName and options values from the interaction.


    //handle actions for each command - reply handled in module by default 
    if (checkFor('play')) {
        return await execute.runAction(interaction, serverQueue, queue); // See: https://github.com/sbd367/DiscordMusicApp/blob/master/Components/execute.js#L15
    } else if(checkFor('list')) {
        return await execute.list(interaction, serverQueue);
    } else if (checkFor('skip')) {
        skipResp = execute.skip(interaction, serverQueue);
        return  serverQueue = await skipResp.newServerQueue;
    } else if (checkFor('stop')) {
        return await execute.stop(interaction, serverQueue);
    } else if (checkFor(' -h')) {
        msg+='you can play youtube songs via \'+play {youtube link}\'\nyou can also skip songs or stop everthing all together by typing either \'+skip\' or \'+stop\'.';
        return await interaction.reply(noNeedToShowChat(msg));
    } else {
        msg+='You need to enter a valid command! - type \'+ -h\''
        return await interaction.reply(noNeedToShowChat(msg));
    }

})

client.login(token);