var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var req = require('request');

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
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    if (user!= bot.username && message.indexOf("/r/") > -1) {
        var lines = message.split('\n')
        for(var l=0;l<lines.length;l++){
            var str=lines[l];
            if(str.indexOf("/r/")>-1 && str.indexOf("reddit.com")==-1){
                var regexp = /^.*\/r\/([a-zA-Z]+).*$/;
                var subreddit = str.match(regexp)[1];

                req.get('https://www.reddit.com/api/search_reddit_names.json?query='+subreddit+'&exact=True', function (error, response, body) {
                    if(error){
                        logger.error(error);
                    }
                    var json=JSON.parse(body);
                        if(json.names == undefined || json.names.length==0){
                            bot.sendMessage({
                                to: channelID,
                                message: "That subreddit doesn't seem to exist... yet. :("
                            });
                        }
                        else{
                            var link= "https://www.reddit.com/r/"+subreddit;
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