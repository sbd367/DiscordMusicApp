# Execute

This is where the magic happens... this JS file contains multiple useful exports that are used by our `index.js` to respond to the users input. 
There's only a couple of modules in here currently, and most are pretty self explanatory. 

## runAction

The back bone of these modules is the `play` method. 
This method gets triggered everytime someone runs our play action... It does the follwing things:
- ensures the proper permissions 
- figures out what kind of search is being run (*Search, link, or playlist*)
- triggers message response (Note: *I like to update the reply depending on the leaf node level of the program*)
- triggers YouTube API calls as needed

![run_action](https://user-images.githubusercontent.com/12818787/144692193-99a6f2a2-c7e5-4f80-8e0c-bbe21a9c8412.png)
