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
    },
    {
        name: 'weather',
        description: 'Returns current weather information for any given zip code',
        options: [
            {
                name: 'zipcode',
                description: 'Valid US zip code',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    {
        name: 'help',
        description: 'You look lost...'
    }
    // {
    //     name: 'player', Shhhh............ soon.
    //     description: 'Use this command to navigate through the song queue.'
    // }
]