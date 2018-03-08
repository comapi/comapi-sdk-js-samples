(function (angular) {
    'use strict';

    angular.module('compapiChat', ['ngSanitize', 'ui.router', 'ui.bootstrap', 'angular-growl', 'naif.base64'])
        /**
         * 
         */
        .run(["$rootScope", "$state", "authService", function ($rootScope, $state, authService) {

            /**
             * Some error has occurred in the routing, redirect to the error page
             */
            $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                $state.go('error', { message: error.message });
            });
            /**
             * Check we are still logged in when transitioning between states
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
                        },
                        params: {
                            message: "An error has occurred"
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
                        /**
                         * We are using resolve to prepare the data required for the chat views.
                         * This view require a list of conversations. 
                         * To get a list of conversations, we need the Comapi Chat layer to be initialised.
                         * We can then query the conversations from the Chat Store.
                         * Initialising the Chat Layer will populate the chat store - we can then just query the conversation list.  
                         */
                        resolve: {
                            conversations: ["comapiService", "comapiChatStore", function (comapiService, comapiChatStore) {
                                return comapiService.initialise()
                                    .then(function (result) {
                                        return comapiChatStore.getConversations();
                                    });
                            }]
                        }

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
                        resolve: {
                            conversationInfo: ["comapiService", "comapiChatStore", "$stateParams", function (comapiService, comapiChatStore, $stateParams) {
                                /**
                                 * To get all the infornation to render a  conversation detail view, we need the Comapi Chat layer to be initialised.
                                 * We can then query the conversationInfo. This retrieves a composite object containing the conversation, the messages and the participants.
                                 */
                                return comapiService.initialise()
                                    .then(function (result) {
                                        return comapiService.getConversationInfo($stateParams.conversationId);
                                    });

                            }]
                        }
                    });
            }]);

})(window.angular);

