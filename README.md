# DiscordMusicApp
## Setup
The setup here is fairly easy, you will be using your own computer to serve the application when you intend to use the service. 
The first step is to clone the repository, then navigate to the directory that you had preveously cloned the app.

You can decide how to handle envrinment variables but I use dotenv and just keep a local `config.json` file in the apps root directory then add it to .gitignore.

That config.json can be configured as such: 

```
{
   "clientId": "your client Id (discord)",
   "prefix": "Prefix of your choozing (i.e. /, pls, +)",
   "token": "Your token (discord)"
}
```

You get these credentials by navigating to the [Discord developer portal](https://discord.com/developers/applications) and finding/creating your bot.

You will also need to set your YouTube API key in a `.env` file within the root dir. This is used to get lists and build youtube video strings. ([see here](https://github.com/sbd367/DiscordMusicApp/blob/master/Components/getListInfo.js#L10)) 

---

Then simply install you local deps by running `npm install` 

Once that's finished then you can run your local dev server by using `npm run start`

## Functionality 

This disord bot, when given a youtube link, will join your voice server and play the audio to your friends. If the link is a part of a youtube playlist then the first 10 songs (so we dont ping YouTube if there's a 1M song playlist) will automatically be added to the queue... 

## Notes
This application was written with the latest version of Discord.js (v13), if you'd like to expand on the project be warry, as there are a lot of differences between v12 and v13. This took a lot longer than expected as documentation is slim...
You can view the Docs for Discord.js [here](https://discord.js.org/#/docs/main/stable/general/welcome).
