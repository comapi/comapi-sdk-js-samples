(function (angular) {
    'use strict';

    /**
     * Controller to manage displaying a list of conversations.
     * The view renders this list and allows the user to drill down into a conversation.
     */
    angular.module('compapiChat')
        .controller('conversationsController', ["$scope", "$state", "$uibModal", "comapiService", "comapiChatStore", "conversations",
            function ($scope, $state, $uibModal, comapiService, comapiChatStore, conversations) {

                $scope.comapiChatStore = comapiChatStore;

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
                            return comapiService.createConversation(conversationInfo);
                        },
                        function () {
                            console.log("Modal dismissed");
                        });
                }

            }]);

})(window.angular);
