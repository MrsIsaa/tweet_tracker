if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const getLatestTweets = require('./functions');
console.log(process.env.ACCOUNT_ID, process.env.BEARER_TOKEN, process.env.WEBHOOK_URL)
getLatestTweets(process.env.ACCOUNT_ID);
