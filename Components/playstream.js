const { createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus} = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
//Await on the opus stream and then play said resource
exports.playStream = async (url, serverQueue) =>  {
    //Init values
    const player = createAudioPlayer(),
         {connection} = serverQueue,
          file = await ytdl(url),
          resource = createAudioResource(file, {
            inputType: StreamType.Opus
          });
    //init
    player.play(resource);
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
        player.play(resource);
        console.log('Auto paused');
    })
    player.on('error', err => {
        console.warn(err);
    });

    //if the queue is at its last item just end connection
    //otherwise play the next song in the queue.
    player.on(AudioPlayerStatus.Idle, () => {
        console.log('its not doing anything', serverQueue)
        if(typeof(serverQueue) === undefined) return connection.destroy();
        serverQueue.songs.shift();
        let newSong = serverQueue.songs[0]
        return serverQueue.songs.length ? this.playStream(newSong.url, player) : connection.destroy();
    })

    return serverQueue;
}