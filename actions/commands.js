const {Constants} = require('discord.js');
exports.commands  = [
    {
        name: 'play',
        description: 'Use this command to play YouTube audio via search or link.',
        options: [
        {
            name: 'search',
            description: 'search term or link to video',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }]
    },
    {
        name: 'skip',
        description: 'Use this command to skip itmes in the playlist.'
    },
    {
        name: 'stop',
        description: 'Use this command to stop itmes in the playlist.'
    },
    {
        name: 'list',
        description: 'Use this command to list itmes in the playlist.'
    }
    // {
    //     name: 'player', Shhhh............ soon.
    //     description: 'Use this command to navigate through the song queue.'
    // }
]