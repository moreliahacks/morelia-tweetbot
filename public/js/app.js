
angular
.module('moreliaConsumer', ['ui.router'])
.config(config)
.run(run)
.controller('MainController', MainController)
.service('Tweet', Tweet);

function config($stateProvider) {

    $stateProvider
    .state('home', {
        url: '/home?dateGte&myParam',
        controller: 'MainController',
        templateUrl: 'home.tpl.html'
    });
}

function run($rootScope, $http) {
    console.log('Its running');
}

function MainController($scope, Tweet, $timeout){

    action();

    function action() {
        Tweet.list().then(function(tweets){
            $scope.tweets = tweets;
        });

        $timeout(action, 10000);
    }
}

function Tweet($http, $stateParams, $state) {
    console.log($stateParams);
    console.log($state);
    var params = {
        'date[$gte]': $stateParams.dateGte,
        'sort[date]': -1
    }

    console.log(params);
    this.list = function(){
        return $http({
            method: 'GET',
            url: 'https://morelia-tweets.herokuapp.com/tweets',
            params: params
        })
        .then(function(response){
            return response.data.data;
        })
        .catch(function(error){
            console.log(error);
        });
    }
}
