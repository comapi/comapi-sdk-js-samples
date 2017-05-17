(function (angular) {
    'use strict';


    /**
     * Controller to manage displaying a list of conversations.
     * We retrieve a list of conversations that the user is a member of and subscribe to variuos events. 
     * The view renders this list and allows the user to drill down into a conversation.
     */
    angular.module('compapiChat')
        .controller('conversationsController', ["$rootScope", "$scope", "$state", "$uibModal", "comapiService", "authService",
            function ($rootScope, $scope, $state, $uibModal, comapiService, authService) {

                // load in all the conversations this user is a member or
                comapiService.getConversations()
                    .then(function (conversations) {
                        $scope.$apply(function () {
                            $scope.conversations = conversations;
                        });
                    })
                    .catch(function (error) {
                        $state.go("error", { data: JSON.stringify(error) });
                    });

                var profileId = authService.getProfileId();

                $rootScope.$on('participantAdded', function (event, info) {
                    console.log("Got a participantAdded", info);
                    // A participant has been added to a conversation
                    // if this is me, need to add this conversation.
                    //  - this could be me creating on this device or on another device
                    if (info.profileId === profileId) {
                        _addConversation(info.conversationId);
                    }
                });

                $rootScope.$on('participantRemoved', function (event, info) {
                    console.log("Got a participantRemoved", info);
                    // A participant has been removed from a conversation.
                    // if this is me, need to remove this conversation
                    if (info.profileId === profileId) {
                        _removeConversation(info.conversationId);
                    }
                });

                $rootScope.$on('conversationDeleted', function (event, info) {
                    console.log("Got a conversationDeleted", info);
                    // a conversation has been deleted, remove it from our list.
                    _removeConversation(info.conversationId);
                });

                $rootScope.$on('conversationMessage.sent', function (event, message) {
                    // A new message has been sent to a conversation that this user is part of
                    // Display a toast notification with a link to the conversation                    
                    growl.info("New message received in another <a href='#/conversations/" + message.context.conversationId + "'>conversation</a>", { title: 'New Message', ttl: 5000 });
                });

                /**
                 * Click handler for create conversations button
                 */
                $scope.createConversation = function () {

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'src/pages/conversations/createConversationModal.html',
                        controller: 'manageConversationCtrl',
                        resolve: {
                            conversationInfo: function () {
                                return null;
                            }
                        }

                    });

                    modalInstance.result.then(
                        function (conversationInfo) {
                            comapiService.createConversation(conversationInfo);
                        },
                        function () {
                            console.log("Modal dismissed");
                        });
                }


                function _removeConversation(conversationId) {
                    for (var i = 0; i < $scope.conversations.length; i++) {
                        if ($scope.conversations[i].id == conversationId) {
                            $scope.$apply(function () {
                                $scope.conversations.splice(i, 1);
                            });
                            break;
                        }
                    }
                }

                function _addConversation(conversationId) {
                    comapiService.getConversation(conversationId)
                        .then(function (conversationInfo) {
                            $scope.$apply(function () {
                                $scope.conversations.push(conversationInfo);
                            });
                        });
                }

            }]);

})(window.angular);
