//bring in libraries and get things all ready n stuff...
require('dotenv').config();
const { Client, Intents } = require('discord.js'),
    // { nouns, adjectives } = require('./assets/staticData'),
    // execute = require('./components/execute'),
    fs = require('fs'),
    path = require('node:path'),
    // player = require('./Components/player'), //TODO
    client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_VOICE_STATES
        ]
    });

    exports.queue = new Map();

    const ePaths = path.join(__dirname, 'events'),
    eFiles = fs.readdirSync(ePaths).filter(file => file.endsWith('.js'));

    //for every file in the events directory, declair that they are actionable.
    for(const file of eFiles){
        const fPath = path.join(ePaths, file),
            event = require(fPath);
        if(event.once) client.once(event.name, (...args) => event.execute(...args));
        else client.on(event.name, (...args) => event.execute(...args));
    }

// client.once('reconnecting', () => {
//     console.log('Reconnecting!');
// });
// client.once('disconnect', () => {
//     console.log('Disconnect!');
// });


// client.on('messageCreate', async (message) => {
//     if (message.author.bot) return;
//     let serverQueue = queue.get(message.guild.id)
//     if (!serverQueue || !serverQueue.songs) {
//         let {  member } = message, //pull the commmandName from the interaction.
//         voiceChannel = member.voice.channel;
//         await setupState(serverQueue, voiceChannel, message);
//         serverQueue = queue.get(message.guild.id);
//     }
//     const nounRandomNumber = Math.floor(Math.random() * (nouns.length - 1)),
//         adjRandomNumber = Math.floor(Math.random() * (adjectives.length - 1)),
//         noun = nouns[nounRandomNumber],
//         adjective = adjectives[adjRandomNumber],
//         condition = message.content[0] === '+';
//     return condition ? await message.reply({ content: `Messages are depricated, use slash commands instead... you ${adjective} ${noun}`}) : null;
// });

client.login(process.env.DISCORD_TOKEN);