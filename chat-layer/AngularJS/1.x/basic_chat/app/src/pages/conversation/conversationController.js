
(function (angular) {
    'use strict';
    /**
     * Component to display a particular conversation
     */
    angular.module('compapiChat')
        .controller('conversationController', ["$log", "$scope", "$stateParams", "$uibModal", "comapiService", "authService", "conversationInfo",
            function ($log, $scope, $stateParams, $uibModal, comapiService, authService, conversationInfo) {
                $scope.conversationId = $stateParams.conversationId;

                $scope.profileId = authService.getProfileId();

                $scope.conversationInfo = conversationInfo;

                $scope.message = {};

                // scroll to the bottom of the conv when a new message comes in
                var $messages = angular.element(document.getElementById("messages"));
                $scope.$watch(function () { return $messages[0].scrollHeight }, function (scrollHeight) {
                    $messages[0].scrollTop = $messages[0].scrollHeight;
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

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'src/pages/conversation/manageParticipantsModal.html',
                        controller: 'manageParticipantsController',
                        resolve: {
                            conversationInfo: function () {
                                return {
                                    id: $scope.conversationId,
                                    participants: $scope.conversationInfo.participants
                                };
                            }
                        }
                    });

                    modalInstance.result.then(
                        function (conversationInfo) {
                            $log.log(conversationInfo);
                        },
                        function () {
                            $log.log("Modal dismissed");
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

                /**
                 * 
                 */
                $scope.setFileData = function (file) {
                    $log.log("setFileData()", file);
                    comapiService.sendAttachment($scope.conversationId, file)
                        .then(function () {
                            // reset the file input
                        });
                }

            }]);

})(window.angular);
