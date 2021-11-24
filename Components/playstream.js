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
    //actions
    player.play(resource);
    player.on(AudioPlayerStatus.Playing, () => console.log('playing audio'))
    player.on('error', err => {
        console.warn(err)
    });
    connection.subscribe(player);
    console.log('QC', queueContruct)

    //if the queue is at its last item just end connection
    //otherwise play the next song in the queue.
    player.on(AudioPlayerStatus.Idle, () => {
        console.log('QC', queueContruct)
        queueContruct.songs.shift();
        if(queueContruct.songs.length){
            stream(queueContruct.songs[0].url, player);
        } else {
            connection.destroy();
        }
    })
}