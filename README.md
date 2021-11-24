# DiscordMusicApp
## Setup
The setup here is verry easy, you will be using your own computer to serve the application when you intend to use the service. 
The first step is to clone the repository, then navigate to the directory that you had preveously cloned the app.

You can decide how to handle envrinment variables but I just keep a local `config.json` file in the apps root directory and add it to .gitignore
That config.json can be configured as such: 
`{
    "clientId": "your client Id",
    "prefix": "Prefix of your choozing (i.e. /, pls, +)",
    "token": "Your token"
}`

then simply install you local deps by running `npm install` 
once that's finished then you can run your local dev server by using `npm run start`

## Notes
This application was written with the latest build of Discord.js v13 if youd like to expand on the project be warry there are a lot of differences between v12 and v13. This took a lot longer than expected...
You can view the Docs for Discord.js [here](https://discord.js.org/#/docs/main/stable/general/welcome).
