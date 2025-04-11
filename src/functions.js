require('dotenv').config()
const axios = require('axios');

const { getID, updateID } = require('./firebase');

// Your webhook URL should look something like https://discord.com/api/webhooks/id/token

/* 
    GET tweets from the account ID
    Filter the wanted information with options 
    Checks for rate-limit
    Checks if user has posted more than one tweet since last time (last saved ID) and saves last tweet (updateID)
    Sends all tweets in order
*/
async function getLatestTweets(id) {


    const url = `https://api.twitter.com/2/users/${id}/tweets`;
    const options = {
        headers: {
        "authorization": `Bearer ${process.env.BEARER_TOKEN}`
        },
        params: {
            max_results: 5,
            "tweet.fields": "created_at,referenced_tweets,author_id,in_reply_to_user_id",
            "expansions": "referenced_tweets.id.author_id,in_reply_to_user_id",
            "user.fields": "username" 
        }
    }

    try {

        const response = await axios.get(url, { headers: options.headers, params: options.params });

        const tweets = response.data.data;
        const includes = response.data.includes;
        let lastID = await getID();

        if(!tweets || tweets.length == 0) return console.log("⚠️ | [ Error ]: Couldn't get tweets.");
        if(tweets[0].id == lastID) return console.log("⚠️ | No new tweets since last time.");

        
        const newTweets = tweets.slice(0, tweets.findIndex(tweet => tweet.id === lastID));
        updateID(newTweets[0].id);
        // const tweetsInOrder = newTweets.reverse();

        for(let i = 0; i < newTweets.length; i++) {
            sendTweet(newTeets[i], includes);
            console.log(`✅ | [ Sent ]: new tweet No.${i + 1}`);
        }

        rate_limit = response.headers['x-rate-limit-remaining']
        const reset = response.headers['x-rate-limit-reset']*1000;

        console.log(" [ Current requests available ]: " + rate_limit);
        console.log(" [ Rate limit reset (Local Time) ]: in " + new Date(reset - Date.now()).getMinutes() + ` minutes. (${new Date((reset)).toLocaleTimeString()})`);
        
    } catch (error) {
        if (error.response) {
            // \x1b[30;41m Red color
            // \x1b[0m Reset color
            console.log(`⚠️ | [ Error while trying to get tweets ]:`, `\x1b[37;41;4m${error.response.status} ${error.response.statusText}\x1b[0m`);
            console.log("⚠️ | [ Current requests available ]: " + error.response.headers['x-rate-limit-remaining']);
            console.log("⚠️ | [ Rate limit reset (Local Time) ]: in " + new Date((error.response.headers['x-rate-limit-reset'] * 1000) - Date.now()).getMinutes() + ` minutes. (${new Date((error.response.headers['x-rate-limit-reset'] * 1000)).toLocaleTimeString()})`)

        } else {
            console.log(`⚠️ | [ Error while trying to get tweets ]:\n`, error);
            // console.log("⚠️ | [ Current requests available ]: " + response.headers['x-rate-limit-remaining']);
            // console.log("⚠️ | [ Rate limit reset (Local Time) ]: in " + new Date((response.headers['x-rate-limit-reset'] * 1000) - Date.now()).getMinutes() + ` minutes. (${new Date((response.headers['x-rate-limit-reset'] * 1000)).toLocaleTimeString()})`)
        }
    }

}

/* 
    Sends message with the tweet link in the designated webhook channel.
*/
function sendTweet(tweet, includes) {
    const tweetUrl = `https://twitter.com/i/web/status/${tweet.id}`;
    const message = identifyTweetType(tweet, includes);

    setTimeout(async() => {

        try {
            await axios.post(process.env.WEBHOOK_URL,
                { content: `[${message}](${tweetUrl})`
            },
            { json: true });  
        } catch(error) { 
            console.log('⚠️ | [ Error while trying to send tweets ]: ', error.message)
        }  

    }, 1000);

}

/*
    Checks if the post is an original tweet or if it's a retweet, a quote, or a reply.
    Returns a different message for each type of tweet.
*/
function identifyTweetType(tweet, includes) {

    if(!tweet.referenced_tweets) return "Tweeted";

    const username = getUsername(tweet, tweet.referenced_tweets[0], includes);
    const messages = {
        "retweeted": `Retweeted @${username}`,
        "replied_to": `Replying to @${username}`,
        "quoted": `Quoted @${username}`
    }

    return messages[tweet.referenced_tweets[0].type];
}

/* 
    Finds the replied to/retweeted/quoted user's ID in the array.
    Finds replied to/retweeted/quoted user's username.
*/
function getUsername(tweet, ref_tweet, includes) {

    const originalAuthorID = ref_tweet.type === "replied_to" ? tweet.in_reply_to_user_id : includes.tweets.find(tweet => tweet.id === ref_tweet.id)?.author_id;
    const originalAuthorUsername = includes.users.find(user => user.id === originalAuthorID)?.username;

    return originalAuthorUsername || "unknown_user";
}


module.exports = getLatestTweets;
