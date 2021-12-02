const { createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus} = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
//Await on the opus stream and then play said resource
exports.playStream = async (url, connection, queueContruct) =>  {
    //Init values
    const player = createAudioPlayer(),
          file = await ytdl(url),
          resource = createAudioResource(file, {
            inputType: StreamType.Opus
          });
    //init
    player.play(resource);
    console.log('we\'re trying')
    connection.subscribe(player);
    //listeners
    player.on(AudioPlayerStatus.Buffering, () => {
        console.log('Buffering')
    })
    player.on(AudioPlayerStatus.Paused, () => {
        console.log('paused');
    })
    player.on(AudioPlayerStatus.Playing, () => console.log('playing audio'))
    player.on(AudioPlayerStatus.AutoPaused, () => {
        console.log('Auto paused');
    })
    player.on('error', err => {
        console.warn(err);
    });

    //if the queue is at its last item just end connection
    //otherwise play the next song in the queue.
    player.on(AudioPlayerStatus.Idle, () => {
        console.log('its not doing anything', queueContruct)
        if(typeof(queueContruct) === undefined) return connection.destroy();
        queueContruct.songs.shift();
        if(queueContruct.songs.length){
            this.playStream(queueContruct.songs[0].url, player);
        } else {
            connection.destroy();
        }
    })

    return queueContruct;
}