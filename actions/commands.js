const {Constants} = require('discord.js');
exports.commands  = async commands => {
    return await commands.create?.(
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
        name: 'stop',
        description: 'Disconnects the player.',
    },
    {
        name: 'skip',
        description: 'Skips the current song in the queue.'
    },
    {
        name: 'list',
        description: 'Shows the channel the queue list.'
    });
}