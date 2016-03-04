
angular
.module('moreliaConsumer', [])
.config(config)
.run(run)
.controller('MainController', MainController)
.service('Tweet', Tweet);

function config() {}

function run($rootScope, $http) {
    console.log('Its running');
}

function MainController($scope, Tweet, $timeout){

    action();

    function action() {
        Tweet.list().then(function(tweets){
            $scope.tweets = tweets.reverse();
        });

        $timeout(action, 10000);
    }
}

function Tweet($http) {
    this.list = function(){
        return $http({
            method: 'GET',
            url: 'https://morelia-tweets.herokuapp.com/tweets',
            params:{
                limit: 100
            }
        })
        .then(function(response){
            return response.data.data;
        })
        .catch(function(error){
            console.log(error);
        });
    }
}
