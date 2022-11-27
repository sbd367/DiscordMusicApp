# DiscordMusicApp

## Setup
The setup here is fairly easy, you will be using your own computer to serve the application when you intend to use the service. 
The first step is to clone the repository, then navigate to the directory that you had preveously cloned the app.

> Install your local deps by running `npm install` 

### There are 6 credendials required to use this app

Add the folling variables to a `.env` file
1. `YOUTUBE_API_KEY` - Your valid YouTube API key. ([see docs here](https://developers.google.com/youtube/v3))
2. `DISCORD_TOKEN`
3. `DISCORD_CLIENT_ID`
4. `WEATHER_API_KEY`
5. `NASA_API_KEY`
6. `RAPID_API_KEY`

> **For items 2 and 3 you can simply add the approptiate credentials for your discord bot.** ([Discord Developer Portal](https://discord.com/developers/applications))

---
Once that's finished then you can run your local dev server by using `npm run start`

## Deploy
This project is pre-set for you to deploy on heroku with little to no effort. [See more about deploying to heroku](https://devcenter.heroku.com/articles/deploying-nodejs)\
Also take a look into what [Workers](https://devcenter.heroku.com/articles/background-jobs-queueing) are within Heroku

## Functionality 

This disord bot, when given a youtube link or search term, will join your voice server and play that audio to your friends. If you provide a link that is part of a YouTube playlist, then the first 10 songs (so we dont ping YouTube if there's a 1M song playlist) will be added to the queue... 

## Notes
If you wanna see more about how this thing works check out the attached [docs](https://github.com/sbd367/DiscordMusicApp/tree/master/docs)\
You can view the Docs for Discord.js [here](https://discord.js.org/#/docs/main/stable/general/welcome).
