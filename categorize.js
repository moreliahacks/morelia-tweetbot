'use strict';

var dictionary = require('./categories.json');

module.exports = function(tweet){
    var _categories = [];

    for(var key in dictionary){
        console.log(key.toLowerCase());

        if(tweet.toLowerCase().match(key.toLowerCase())){
            _categories.push(dictionary[key]);
        }
    }

    var _unique = [];

    _categories.forEach(function(_categorie){
        if(_unique.indexOf(_categorie) < 0){
            _unique.push(_categorie)
        }
    });

    return _unique;
}
