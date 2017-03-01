var app = angular.module('myApp', ['ngRoute', 'ngStorage', 'ngFileUpload', 'angular.vertilize', 'ngMask']);

var API_ENDPOINT = "https://listadepresentes-api.herokuapp.com/api";

app.config(function($routeProvider, $locationProvider, $httpProvider) {

  $routeProvider
    .when('/', {
      pageTitle: 'Lista de Presentes',
      templateUrl: '/views/home.html',
      controller: 'HomeCtrl'
    })
    .when('/dashboard', {
      pageTitle: 'Dashboard',
      menuActive: 'dashboard',
      templateUrl: '/views/dashboard.html',
      controller: 'DashboardCtrl'
    })
    .when('/evento', {
      pageTitle: 'Meu evento',
      menuActive: 'event',
      templateUrl: '/views/evento.html',
      controller: 'EventCtrl'
    })
    .when('/lista-presentes', {
      pageTitle: 'Lista de Presentes',
      menuActive: 'presents',
      templateUrl: '/views/lista-presentes.html',
      controller: 'PresentsCtrl'
    })
    .when('/minha-lista', {
      pageTitle: 'Minha Lista de Presentes',
      menuActive: 'myList',
      templateUrl: '/views/minha-lista.html',
      controller: 'MyListCtrl'
    })
    .when('/meus-presentes', {
      pageTitle: 'Meus Presentes',
      menuActive: 'myPresents',
      templateUrl: '/views/meus-presentes.html',
      controller: 'MyPresentsCtrl'
    })
    .when('/confirmacoes', {
      pageTitle: 'Confirmações de Presença',
      menuActive: 'confirmations',
      templateUrl: '/views/confirmacoes.html',
      controller: 'ConfirmationsCtrl'
    })
    .when('/vaquinha', {
      pageTitle: 'Vaquinha',
      menuActive: 'donations',
      templateUrl: '/views/vaquinha.html',
      controller: 'DonationsCtrl'
    })
    .when('/login', {
      pageTitle: 'Login',
      templateUrl: '/views/login.html',
      controller: 'LoginCtrl'
    })
    .when('/cadastrar', {
      pageTitle: 'Cadastrar',
      templateUrl: '/views/cadastrar.html',
      controller: 'RegisterCtrl'
    })
    .when('/logout', {
      templateUrl: '/views/login.html',
      controller: 'LogoutCtrl'
    })
    .when('/404', {
      pageTitle: 'Página não encontrada',
      templateUrl: '/views/404.html'
    })
    .when('/:slug', {
      pageTitle: 'Lista de Presentes',
      templateUrl: '/views/publico.html',
      controller: 'PublicCtrl'
    })
    .when('/:slug/confirmacao', {
      pageTitle: 'Lista de Presentes',
      templateUrl: '/views/publico-confirmacao.html',
      controller: 'PublicConfirmationCtrl'
    })
    .when('/:slug/vaquinha', {
      pageTitle: 'Lista de Presentes',
      templateUrl: '/views/publico-vaquinha.html',
      controller: 'PublicDonationCtrl'
    })
    .otherwise({
      redirectTo: '/404'
    });

  $locationProvider.html5Mode(true);

  // Insert Token in Header HTTP
  $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function($rootScope, $route, $location, $window) {
  $rootScope.$on('$routeChangeSuccess', function() {
    // track pageview on state change
    $window.ga('send', 'pageview', $location.path());

    document.title = $route.current.pageTitle;
    $rootScope.menuActive = $route.current.menuActive;
  });

  // initialise google analytics
  $window.ga('create', 'UA-91469585-1', 'auto');
});
