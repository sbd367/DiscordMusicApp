const {setupState} = require('./common');
let {queue} = require('../state/songQueue');

module.exports = {
    name: 'messageCreate',
    once: false,
    execute(message) {
        console.log('Starting message create');
        if (message.author.bot) return;
        let serverQueue = queue.get(message.guild.id)
        if (!serverQueue || !serverQueue.songs) {
            let {  member } = message, //pull the commmandName from the interaction.
            voiceChannel = member.voice.channel;
            setupState(serverQueue, voiceChannel, message);
            serverQueue = queue.get(message.guild.id);
        }
        // const nounRandomNumber = Math.floor(Math.random() * (nouns.length - 1)),
        //     adjRandomNumber = Math.floor(Math.random() * (adjectives.length - 1)),
        //     noun = nouns[nounRandomNumber],
        //     adjective = adjectives[adjRandomNumber],
        //     condition = message.content[0] === '+';
        // return condition ? message.reply({ content: `Messages are depricated, use slash commands instead... you ${adjective} ${noun}`}) : null;
        return null;
    }
}