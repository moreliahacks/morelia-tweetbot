
angular
.module('moreliaConsumer', ['ui.router', 'ui.materialize'])
.config(config)
.run(run)
.controller('MainController', MainController)
.service('Tweet', Tweet);

function config($stateProvider) {
    $stateProvider
    .state('home', {
        url: '?dateGte&dateLt&category',
        controller: 'MainController',
        templateUrl: 'views/home.tpl.html',
        cache: false,
        reloadOnSearch: true
    });
}

function run($rootScope, $http) {
    console.log('Its running');
}

function MainController($scope, Tweet, $timeout, $state){

    var params = $state.params;

    $scope.updateParams = updateParams;
    $scope.params = angular.copy($state.params);

    $scope.categories = [
        'movilidad', 'seguridad', 'servicios públicos', 'salud',
        'turismo', 'deportes', 'eventos', 'ninguna', 'todas'
    ];

    $scope.sentimentals = [
        'positivo', 'negativo', 'neutro'
    ];

    action();

    function updateParams(data) {
        params = data;
        $state.go('home', params);
        action();
    }

    function action() {
        Tweet.list(params).then(function(tweets){
            $scope.tweets = tweets;
        });

        $timeout(action, 20000);
    }
}

function Tweet($http) {

    this.list = function(data){
        var params = {
            'date[$gte]': data.dateGte,
            'date[$lt]': data.dateLt,
            'sort[date]': -1
        }

        if(data.category && data.category != 'ninguna' && data.category != 'todas'){
            params.categories = [data.category];
        }
        else if(data.category && data.category == 'ninguna'){
            params['categories[$size]'] = 0;
        }

        console.log(params);

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
