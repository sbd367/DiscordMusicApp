module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        const username = client.user.username;
        console.log(`----------we\'re good to go----------\nOnline as "${username}"`);
    }
}