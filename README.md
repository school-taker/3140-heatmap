# 3140-heatmap

Basic web app to show a heatmap of the keys on a virtual keyboard that people have typed. Simply type on the page to see the keys change!

Give it a spin at https://heatmap-keyboard.deno.dev/

## Usage
You need [deno](https://deno.land/) to run this. 
After installing, run:
```sh
deno run --allow-net --allow-read index.ts
```

## Code
Our `index.ts` file is our backend and main entry point. It works to serve the main files, but also allow us to `/keys` for a json heatmap and `/emit` to post some new data! There is no "cheat" detection right now, although in the future, limiting the input to 35 keys per second seems reasonable.

Within `/static` is our frontend. Plain HTML, but we use JS to generate the keyboard keys out of convinience. We also set up our keyboard to respond to key presses and indent. Sounds are played from discord links because they seem to allow that for now. Presses get logged in a heatmap and sent to the server every 5 seconds, when we also update our local one with the servers.
`lib.js` is just a cool proxy function to generate html using JS. 

# Deployment
CI/CD is done from deno.deploy so there is no configuration file needed. However, you can run the code in docker with
```sh
docker build -t app . && docker run -it -p 8000:8000 app
```
using the provided docker file and then navigate to http://localhost:8000

I would put proof of logs here, but deno deploy does not generate logs. This link will have to suffice: https://i.imgur.com/wr2Ifvg.png
