const { createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus} = require('@discordjs/voice');
const ytdl = require('discord-ytdl-core');
//Await on the opus stream and then play said resource
exports.playStream = async (url, serverQueue, retry = 0) =>  {
    //Init values
    try {
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
    } catch (err) {
        if(err){
            console.warn('ERROR from ytdl', err);
            retry < 5 ? this.playStream(url, serverQueue, (retry + 1)) : console.warn('------ran out of re-trys-------');
            if(serverQueue.songs.length > 1){
                console.log('Trying next song in queue.')
                serverQueue.songs.shift();
                let newSong = serverQueue.songs[0]
                this.playStream(newSong.url, serverQueue, 0)
            };
        };
    };

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