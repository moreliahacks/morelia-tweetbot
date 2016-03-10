
angular
.module('moreliaConsumer', ['ui.router', 'ui.materialize', 'ngUnderscore'])
.config(config)
.controller('MainController', MainController)
.service('Tweet', Tweet);

function config($stateProvider) {
    $stateProvider
    .state('home', {
        url: '?dateGte&dateLt&category&sentiment',
        controller: 'MainController',
        templateUrl: 'views/home.tpl.html',
        cache: false,
        reloadOnSearch: true
    });
}

function MainController($scope, Tweet, $timeout, $state, _){

    var params = $state.params;

    if(!params.dateGte &&  !params.dateLt){
        var date = new Date();
        params.dateGte = [
            date.getFullYear(), '-', date.getMonth()+1, '-', date.getDate()
        ].join('');
    }

    $scope.loading = false;
    $scope.updateParams = updateParams;
    $scope.params = angular.copy($state.params);

    $scope.categories = [
        'movilidad', 'seguridad', 'servicios públicos', 'salud',
        'turismo', 'deportes', 'eventos', 'ninguna', 'todas'
    ];

    $scope.sentimentals = [
        'positivo', 'negativo', 'neutro', 'todos'
    ];

    action();

    function updateParams(data) {
        params = data;
        $state.go('home', params);
        action();
    }

    function action() {
        $scope.loading = true;

        Tweet.list(params)
        .then(function(tweets){
            $scope.tweets = tweets;
            $scope.loading = false;

            var data = [
                {
                    value: totalCategory(tweets, 'movilidad').length,
                    color:"#f44336",
                    highlight: "#ef5350",
                    label: 'MOVILIDAD'
                },
                {
                    value: totalCategory(tweets, 'seguridad').length,
                    color: "#9c27b0",
                    highlight: "#ab47bc",
                    label: 'SEGURIDAD'
                },
                {
                    value: totalCategory(tweets, 'servicios públicos').length,
                    color: "#3f51b5",
                    highlight: "#3f51b5",
                    label: 'SERVICIOS PÚBLICOS'
                },
                {
                    value: totalCategory(tweets, 'salud').length,
                    color: "#03a9f4",
                    highlight: "#29b6f6",
                    label: 'SALUD'
                },
                {
                    value: totalCategory(tweets, 'turismo').length,
                    color: "#8bc34a",
                    highlight: "#7cb342",
                    label: 'TURISMO'
                },
                {
                    value: totalCategory(tweets, 'deportes').length,
                    color: "#607d8b",
                    highlight: "#78909c",
                    label: 'DEPORTES'
                },
                {
                    value: totalCategory(tweets, 'eventos').length,
                    color: "#ff5722",
                    highlight: "#ff7043",
                    label: 'EVENTOS'
                }
            ];

            new Chart(
                document.getElementById('polar-chart').getContext("2d")
            ).PolarArea(data, {
                responsive: true,
            });

            console.log(categoryPuntuation(tweets));

            var data = {
                labels: [
                    'Movilidad', 'Seguridad', 'Servicios públicos', 'Salud',
                    'Turismo', 'Deportes', 'Eventos'
                ],
                datasets: [
                    {
                        label: "Negativo",
                        fillColor: "#ff5722",
                        strokeColor: "#ff7043",
                        highlightFill: "#ff8a65",
                        highlightStroke: "#ffab91",
                        data: categoryPuntuation(tweets, 'negative')
                    },
                    {
                        label: "Neutro",
                        fillColor: "#00bcd4",
                        strokeColor: "#26c6da",
                        highlightFill: "#4dd0e1",
                        highlightStroke: "#80deea",
                        data: categoryPuntuation(tweets, 'neutral')
                    },
                    {
                        label: "Positivo",
                        fillColor: "#8bc34a",
                        strokeColor: "#9ccc65",
                        highlightFill: "#aed581",
                        highlightStroke: "#c5e1a5",
                        data: categoryPuntuation(tweets, 'positive')
                    }
                ]
            };

            new Chart(
                document.getElementById('bar-chart').getContext("2d")
            ).Bar(data, {
                barShowStroke: false,
                responsive: true
            });
        })
        .catch(function(){
            $scope.loading = false;
        });

        $timeout(action, 60000);
    }

    function totalCategory(tweets, category) {
        return _.filter(tweets, function(tweet){
            return _.contains(tweet.categories, category)
        })
    }

    function categoryPuntuation(tweets, action) {
        var categories = [
            'movilidad', 'seguridad', 'servicios públicos', 'salud',
            'turismo', 'deportes', 'eventos'
        ];

        return _.map(categories, function(category){
            return _.filter(tweets, function(tweet){
                if(action == 'positive'){
                    return _.contains(tweet.categories, category) && tweet.sentiment.score > 0;
                }
                else if(action == 'negative'){
                    return _.contains(tweet.categories, category) && tweet.sentiment.score < 0;
                }
                else if(action == 'neutral'){
                    return _.contains(tweet.categories, category) && tweet.sentiment.score == 0;
                }
                else{
                    return false;
                }
            }).length;
        });
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

        if(data.sentiment && data.sentiment == 'positivo'){
            params['sentiment[score][$gte]'] = 1;
        }
        else if(data.sentiment && data.sentiment == 'negativo'){
            params['sentiment[score][$lt]'] = -1;
        }
        else if(data.sentiment && data.sentiment == 'neutro'){
            params['sentiment[score]'] = 0;
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
