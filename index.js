'use strict';

var Twitter         = require('node-tweet-stream')
,   rp              = require('request-promise')
,   categorize      = require('./categorize')
,   express         = require('express')
,   app             = express();

var t = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    token: process.env.TWITTER_ACCESS_TOKEN_KEY,
    token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var mtURL = process.env.PRODUCTION ? 'https://morelia-tweets.herokuapp.com/tweets' : '0.0.0.0:3001/tweets';

t.on('tweet', function (tweet) {
    if(!tweet.text.match('^RT')){
        console.log('tweet received:', tweet.text);
        uploadTweet(tweet);
    }
});

app.use(express.static(__dirname + '/public'));

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
    t.track('morelia');
});

function uploadTweet(tweet) {

    rp({
        url: "https://sentimental-language.herokuapp.com/translate?text=" + tweet.text,
        method: 'GET',
        json: true,
        headers: {
            'User-Agent': 'Morelia-Tweet-Bot'
        },
    })
    .then(
        function(response){
            console.log(categorize(tweet.text));
            return rp({
                url: mtURL,
                method: "POST",
                headers: {
                    'User-Agent': 'Morelia-Tweet-Bot'
                },
                json: true,
                body: {
                    text: tweet.text,
                    twitterId: tweet.id,
                    user: tweet.user.screen_name,
                    sentiment: response.data,
                    date: tweet.created_at,
                    location: {
                        geo: tweet.geo,
                        coordinates: tweet.coordinates ,
                        place: tweet.place
                    },
                    entities: tweet.entities,
                    categories: categorize(tweet.text)
                }
            })
        }
    )
    .catch(
        function(error){
            console.log('Upload error');
        }
    );
}
