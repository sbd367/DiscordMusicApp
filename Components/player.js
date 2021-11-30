const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')
exports.startUp = async (interaction, serverQueue) => {

    if(!serverQueue){
        return interaction.reply({content: 'there are none', ephemoral: true})
    }

    console.log(serverQueue)

    const row = new MessageActionRow()
            .addComponents(
            new MessageButton()
                .setCustomId('pause')
                .setLabel('Pause')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('skip')
                .setLabel('Skip')
                .setStyle('PRIMARY')
            ),
            embed = new MessageEmbed()
            .setColor('DARKER_GREY')
            .setTitle(`Current Song: ${serverQueue.songs[0].title}`)
            .setURL(`${serverQueue.songs[0].url}`);

    return await interaction.reply({contents: 'bleh', ephemoral: true, embeds: [embed], components: [row], fetchReply: true}).then(() => {
        interaction.channel.awaitMessageComponent({ max: 1, time: 30000, errors: ['time'] }).then( option => {
            let skip = option.customId === 'skip';
            if(skip){
                interaction.followUp({content: 'Skipped', ephemoral: true})
            } else if (!skip) {
                interaction.followUp({content: 'Skipped', ephemoral: true})
            }
        }).catch(err => {
            //time ran out
            interaction.followUp({content: 'you\'ve ran out of time', ephemoral: true})
        })
    })  
}