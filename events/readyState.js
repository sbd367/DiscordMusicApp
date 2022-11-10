module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        //things I need... serverID, bot username
        const username = client.user.username;
        console.log('were good to go', client.channels);
    }
}