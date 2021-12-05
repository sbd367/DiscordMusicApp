const { createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus} = require('@discordjs/voice');
const ytdl = require('discord-ytdl-core');
//Await on the opus stream and then play said resource
exports.playStream = async (url, serverQueue) =>  {
    //Init values
    const player = createAudioPlayer(),
         {connection} = serverQueue,
          file = await ytdl(url, {
            filter: 'audioonly',
            opusEncoded: true
        }),
        resource = await createAudioResource(file, {
        inputType: StreamType.Opus
        });
    //init
    console.log('got rescource')
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
        console.log('Auto paused - bad response from ytdl');
    })
    player.on('error', err => {
        console.warn(err);
    });

    //if the queue is at its last item just end connection
    //otherwise play the next song in the queue.
    player.on(AudioPlayerStatus.Idle, () => {
        if(typeof(serverQueue) === undefined) return connection.destroy();
        serverQueue.songs.shift();
        let newSong = serverQueue.songs[0]
        return serverQueue.songs.length ? this.playStream(newSong.url, serverQueue) : connection.destroy();
    })

    return serverQueue;
}