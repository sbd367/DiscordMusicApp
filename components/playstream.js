const { createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType, AudioPlayerStatus} = require('@discordjs/voice');
const ytdl = require('play-dl');
//Await on the opus stream and then play said resource
exports.playStream = async (url, serverQueue, retry = 0) =>  {
    //Init values
    try {
        const {connection} = serverQueue,
          file = await ytdl.stream(url),
          resource = await createAudioResource(file.stream, {
              inputType: file.type
          }),
          player = createAudioPlayer({behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
          }});
          console.log("file type", file.type);
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
            console.log('Auto paused - bad response from ytdl');
        })
        player.on('error', err => {
            console.log(err, 'ERROR: Discord player');
        });

        //if the queue is at its last item just end connection
        //otherwise play the next song in the queue.
        player.on(AudioPlayerStatus.Idle, () => {
            console.log('runs idle')
            if(typeof(serverQueue) === undefined) return connection.destroy();
            serverQueue.songs.shift();
            let newSong = serverQueue.songs[0]
            return serverQueue.songs.length ? this.playStream(newSong.url, serverQueue) : null;
        });
        return serverQueue;
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
            throw new Error(err);
        };
    };
}