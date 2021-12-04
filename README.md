# DiscordMusicApp

## Setup
The setup here is fairly easy, you will be using your own computer to serve the application when you intend to use the service. 
The first step is to clone the repository, then navigate to the directory that you had preveously cloned the app.

> Then simply install your local deps by running `npm install` 

You can decide how to handle envrinment variables but I like to use [dotenv](https://www.npmjs.com/package/dotenv)

### There are 4 credendials required to use this app

1. `YOUTUBE_API_KEY` - Your valid YouTube API key. ([see docs here](https://developers.google.com/youtube/v3))
2. `DISCORD_TOKEN`
3. `DISCORD_CLIENT_ID`
4. `GUILD_ID`

> For items 2-4 you can simply add the approptiate credentials for your discord bot. ([Discord Developer Portal](https://discord.com/developers/applications))

---
Once that's finished then you can run your local dev server by using `npm run start`

## Deploy
This project is pre-set for you to deploy on heroku with little to no effort. [See more about deploying to heroku](https://devcenter.heroku.com/articles/deploying-nodejs)\
Also take a look into what [Workers](https://devcenter.heroku.com/articles/background-jobs-queueing) are within Heroku

## Functionality 

This disord bot, when given a youtube link or search term, will join your voice server and play that audio to your friends. If you provide a link that is part of a YouTube playlist, then the first 10 songs (so we dont ping YouTube if there's a 1M song playlist) will be added to the queue... 

## Notes
[see docs]() about how this thing works\
This application was written with the latest version of Discord.js (v13), if you'd like to expand on the project be warry, as there are a lot of differences between v12 and v13. This took a lot longer than expected as documentation is slim...
You can view the Docs for Discord.js [here](https://discord.js.org/#/docs/main/stable/general/welcome).
