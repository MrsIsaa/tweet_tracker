if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const getLatestTweets = require('./functions');
getLatestTweets(process.env.ACCOUNT_ID);
