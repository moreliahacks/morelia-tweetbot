'use strict';

var Twitter         = require('twitter')
,   rp              = require('request-promise')
,   conta           = 0;

var client = new Twitter({
    consumer_key: 'vb5Rd7e4qBn1O1aNEeCM5XDBd',
    consumer_secret: 'ggOnDAdRH94J4WnPJtkMJZ6O9XZTBc5H1xjERUnW7Vx8wteoIv',
    access_token_key: '926049230-ihXw9odyvwZ2Z7M3mYAquSJp8bjAHSF4vaiZeLdR',
    access_token_secret: 'epEx5grknutXov9E7pkzK37WwLKO6YOQqFTpZ6B8jcg94'
});

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
                    console.log(sentimental);
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
                            sentiment: sentimental,
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
