//bring in libraries and get things all ready n stuff...
require('dotenv').config();
const { Client, Intents } = require('discord.js'),
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

    const ePaths = path.join(__dirname, 'events'),
    eFiles = fs.readdirSync(ePaths).filter(file => file.endsWith('.js'));

    //for every file in the events directory, require and declair that they are actionable.
    for(const file of eFiles){
        const fPath = path.join(ePaths, file),
            event = require(fPath);
        if(event.once) client.once(event.name, (...args) => event.execute(...args));
        else client.on(event.name, (...args) => event.execute(...args));
    }

client.login(process.env.DISCORD_TOKEN);