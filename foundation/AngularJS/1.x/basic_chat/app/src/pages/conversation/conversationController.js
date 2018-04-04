(function (angular) {
    'use strict';
    /**
     * Component to display a particular conversation
     */
    angular.module('compapiChat')
        .controller('conversationController', ["$rootScope", "$scope", "$state", "$stateParams", "$uibModal", "comapiService", "authService", "growl",
            function ($rootScope, $scope, $state, $stateParams, $uibModal, comapiService, authService, growl) {
                $scope.conversationId = $stateParams.conversationId;

                $scope.profileId = authService.getProfileId();

                $scope.message = {};

                comapiService.getConversation($scope.conversationId)
                    .then(function (conversation) {
                        $scope.conversation = conversation;
                        return comapiService.getParticipantsInConversation($scope.conversationId);
                    })
                    .then(function (participants) {
                        $scope.participants = participants;
                        return comapiService.getConversationMessages($scope.conversationId);
                    })
                    .then(function (messages) {
                        $scope.messages = messages.reverse();
                        $scope.$apply();
                    })
                    .catch(function (error) {
                        $state.go("error", { data: JSON.stringify(error) });
                    });

                // scroll to the bottom of the conv when a new message comes in
                var $messages = angular.element(document.getElementById("messages"));
                $scope.$watch(function () { return $messages[0].scrollHeight }, function (scrollHeight) {
                    $messages[0].scrollTop = $messages[0].scrollHeight;
                });

                /**
                 * Subscribe to ConversationMessageSent - if the message is from this conversation, add it to the list
                 * If it is for another conversation, render a toast containing a link to that conversation
                 */
                $rootScope.$on('conversationMessage.sent', function (event, message) {
                    console.log("Got a message", message);

                    if (message.context.conversationId === $scope.conversationId) {
                        $scope.$apply(function () {
                            $scope.messages.push(message);
                        });
                    } else {
                        growl.info("New message received in another <a href='#/conversations/" + message.context.conversationId + "'>conversation</a>", { title: 'New Message', ttl: -1 });
                    }
                });

                /**
                 * Function to delete this conversation and navigate back to the list view
                 */
                $scope.deleteConversation = function () {
                    comapiService.deleteConversation($scope.conversationId)
                        .then(function (succeeded) {
                            $state.go('conversations');
                        });
                }

                /**
                 * Click handler for manage participants button
                 */
                $scope.manageParticipants = function () {

                    comapiService.getParticipantsInConversation($scope.conversationId)
                        .then(function (participants) {
                            console.log("getParticipantsInConversation() =>", participants);

                            var conversationInfo = {
                                id: $scope.conversationId,
                                participants: participants
                            }

                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: 'src/pages/conversation/manageParticipantsModal.html',
                                controller: 'manageParticipantsController',
                                resolve: {
                                    conversationInfo: function () {
                                        return conversationInfo;
                                    }
                                }
                            });

                            modalInstance.result.then(
                                function (conversationInfo) {
                                    console.log(conversationInfo);

                                },
                                function () {
                                    console.log("Modal dismissed");
                                });

                        });
                }

                /**
                 * Send a message if enter key is pressed in the textbox
                 */
                $scope.onKeyDown = function ($event) {
                    if ($event.keyCode == 13) {
                        $event.preventDefault();
                        $scope.sendMessage();
                    }
                }

                /**
                 * Function to send a message (and clear the textbox on success)
                 */
                $scope.sendMessage = function () {
                    if ($scope.message.text) {
                        comapiService.sendMessage($scope.conversationId, $scope.message.text);
                        $scope.message.text = "";
                    }
                }

                $scope.onLoadHandler = function (e, reader, file, fileList, fileOjects, fileObj) {
                    console.log("onLoadHandler()");

                    comapiService.sendAttachment($scope.conversationId, fileObj);
                }

            }]);

})(window.angular);
