# Index

## Base connection to discord.js Client

The `index.js` file contains the core logic around connecting with the discord.js library. After bringing in the required variables we create a new Client (brought in from discord.js) with our given intents.

![client_setup](https://user-images.githubusercontent.com/12818787/144689994-4386db33-9fcc-4360-8019-91b4c36f9d91.png)

After we've created our client we add a ready listener that takes the guild ID stored via env and sets our commands for the server (Guild)


![carbon](https://user-images.githubusercontent.com/12818787/144690161-6bb5fe85-4f6f-42ad-82bd-defdbc3e2220.png)

Then at the bottom  of the application we use the login method, passing our `DISCORD_TOKEN` as a parameter 
```
client.login(process.env.DISCORD_TOKEN)
```

## Listeners

`Client` gives us a large array of different actions we can use. For this application all we're concerned with is the `interactionCreate` listener.

> ***From this method we get passed an interaction (gives context of who sent the action, action arguments, and other stuff...)***

we then take the message arguments and respond to the user with our node module stored in `./components/execute.js`\

![interaction_create](https://user-images.githubusercontent.com/12818787/144691034-e52cf89f-1301-49cf-a401-80487e8da272.png)

***If it's the first time the bot is getting used it will have to set an initial state this is done via the setupState method***
>![setupState](https://user-images.githubusercontent.com/12818787/144691273-5566731c-816b-42f0-8c20-653f4d985f58.png)


