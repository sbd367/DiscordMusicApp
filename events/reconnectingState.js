module.exports = {
    name: 'reconnecting',
    once: true,
    execute(info) {
        console.log('Reconnecting to discord client', info);
    }
}