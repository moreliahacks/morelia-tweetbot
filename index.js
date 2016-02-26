'use strict';

var Twitter         = require('twitter')
,   rp              = require('request-promise')

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var mtURL = process.env.PRODUCTION
? 'http://morelia-tweets.herokuapp.com/tweets' : 'http://localhost:3001/tweets';

client.stream('statuses/filter', {track: 'morelia'},  function(stream){
    stream.on('data', function(tweet) {
        uploadTweet(tweet);
    });

    stream.on('error', function(error) {
        console.log(error);
    });
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
            console.log(type of response);
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
                    sentiment: response.data,
                    date: tweet.created_at,
                    location: {
                        geo: tweet.geo,
                        coordinates: tweet.coordinates ,
                        place: tweet.place
                    },
                    entities: tweet.entities
                }
            })
        }
    )
    .catch(
        function(){
            console.log('Upload error');
        }
    );

}


/*

action();

function action() {

client.get('search/tweets', {q: 'Morelia'}, function(error, tweets, response){
tweets.statuses.forEach(function(tweet){

console.log(tweet.text);

rp({
url: "https://sentimental-language.herokuapp.com/translate?text=" + tweet.text,
method: 'GET',
headers: {
'User-Agent': 'Morelia-Tweet-Bot'
},
}).then(
function(sentimental){
console.log(sentimental.data);
rp({
url: "http://localhost:3001/tweets",
method: "POST",
headers: {
'User-Agent': 'Morelia-Tweet-Bot'
},
json: true,
body: {
text: tweet.text,
twitterId: tweet.id,
categories: ['Morelia'],
sentiment: sentimental.data,
date: tweet.created_at,
location: {
geo: tweet.geo,
coordinates: tweet.coordinates ,
place: tweet.place
},
hashtags: tweet.text.match(/(^|\W)(#[a-z\d][\w-]*)/ig),
mentions: tweet.text.match(/(^|\W)(@[a-z\d][\w-]*)/ig)
}
})
.then(function(success){
console.log('Success');
})
.catch(function(error){
console.log('Error');
})
}
)


});
});

console.log('Action number: ' + ++conta);

setTimeout(action, 300000);
}
*/
