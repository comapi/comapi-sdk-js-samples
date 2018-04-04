(function (angular) {
    'use strict';

    angular.module('compapiChat', ['ngSanitize', 'ui.router', 'ui.bootstrap', 'angular-growl', 'naif.base64'])
        /**
         * 
         */
        .run(["$rootScope", "$state", "authService", function ($rootScope, $state, authService) {

            /**
             * Check we are still logged in wnen transitioning between states
             */
            $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                if (toState.authenticate && authService.getProfileId() === null) {
                    event.preventDefault();
                    $state.transitionTo("login");
                }
            });
        }])
        /**
         * 
         */
        .config(['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {

                // Make conversations the default page ...
                $urlRouterProvider.otherwise('/conversations');

                $stateProvider
                    .state('error', {
                        url: '/error/:data',
                        views: {
                            content: {
                                templateUrl: 'src/pages/error/error.html',
                                controller: 'errorController',
                            }
                        }
                    })
                    .state('login', {
                        url: '/login',
                        views: {
                            content: {
                                templateUrl: 'src/pages/login/login.html',
                                controller: 'loginController',
                            }
                        }
                    })
                    .state('conversations', {
                        url: '/conversations',
                        views: {
                            content: {
                                templateUrl: 'src/pages/conversations/conversations.html',
                                controller: 'conversationsController',
                            }
                        },
                        authenticate: true,

                    })
                    .state('conversation', {
                        url: '/conversations/{conversationId}',
                        views: {
                            content: {
                                templateUrl: 'src/pages/conversation/conversation.html',
                                controller: 'conversationController',
                            }
                        },
                        authenticate: true,
                    });
            }]);

})(window.angular);

