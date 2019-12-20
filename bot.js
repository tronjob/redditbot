var Discord = require('discord.io')
var logger = require('winston')
var auth = require('./auth.json')
var req = require('request')
var cron = require('node-cron')
const readline = require('readline')
const fs = require('fs')
const subredditsFile = './presenceSubreddits.txt'
var subreddits = []

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

//populate the random presence subreddits array from file
async function populateSubredditArray(){
    try{
        await fs.promises.access(subredditsFile);
        cron.schedule("*/30 * * * *", randomSubredditPresence)
        const readInterface = readline.createInterface({
            input: fs.createReadStream(subredditsFile),
            console: false
        });
        readInterface.on('line', function(line){
            subreddits.push(line)
        });
    }
    catch(error){
        console.log("Subreddits file does not exist, randomPresence disabled")
    }
}
//change subreddit presence to a random subreddit from a list
function randomSubredditPresence(){
    chosen = subreddits [Math.floor(Math.random()*subreddits.length)]
    bot.setPresence({ status: 'online', game: { type: 3, name: chosen, url: "https://reddit.com" } });
}

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    bot.setPresence({ status: 'online', game: { name: "Let's get physical" } });
    populateSubredditArray()
});

bot.on('message', function (user, userID, channelID, message, evt){
    tokens = message.split(' ');

    if (tokens.length > 1 && tokens[0]=="!rlpresence") {
        presence = tokens.slice(1,tokens.length).join(' ')
        logger.info("Switching presence to: "+presence);
        bot.setPresence({ status: 'online', game: { name: presence } });
    }
});

bot.on('message', function (user, userID, channelID, message, evt) {
    if (user != bot.username) {
        let regexp = /(?:^|\s)\/?r\/([a-zA-Z_0-9]+)/gm
        let match = [...message.matchAll(regexp)]
        if(Array.isArray(match) && match.length){
            for(let i=0;i<match.length;i++){
                let subreddit = match[i][1];
                req.get('https://www.reddit.com/api/search_reddit_names.json?query='+subreddit+'&exact=True', function (error, response, body) {
                    if(error){
                        logger.error(error);
                    }
                    let json=JSON.parse(body);
                        if(json.names == undefined || json.names.length==0){
                            bot.sendMessage({
                                to: channelID,
                                message: "That subreddit doesn't seem to exist... yet. :("
                            });
                        }
                        else{
                            let link= "https://www.reddit.com/r/"+subreddit;
                            bot.sendMessage({
                                to: channelID,
                                message: link
                            });
                        }
                });
            }
        }
    }
});