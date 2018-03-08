(function (angular) {
    'use strict';

    angular.module('compapiChat')
        /**
         * Component to manage the participants of this conversation
         * The current participants are passed in and any modifications are made when the user presses the save button within this component.
         */
        .controller('manageParticipantsController', ['$scope', '$log', '$uibModalInstance', 'comapiService', 'conversationInfo',
            function ($scope, $log, $uibModalInstance, comapiService, conversationInfo) {

                $scope.conversationInfo = conversationInfo;

                // array of participants to add 
                $scope.added = [];
                // array of participants to remove 
                $scope.removed = [];

                $scope.newParticipant = {
                    id: "",
                    role: "participant"
                };

                /**
                 * Method to remove a participant from the participants list 
                 */
                $scope.removeParticipant = function (id) {

                    var index = -1;

                    angular.forEach($scope.conversationInfo.participants, function (participant, key) {
                        if (participant.id === id) {
                            $log.log(key);
                            index = key;

                            $scope.removed.push(participant.id);
                        }
                    });

                    $scope.conversationInfo.participants.splice(index, 1);
                };

                /**
                 * Method to add a participant from the participants list 
                 */
                $scope.addParticipant = function () {

                    var participant = {
                        id: $scope.newParticipant.id,
                        role: $scope.newParticipant.role
                    };

                    $scope.conversationInfo.participants.push(participant);
                    $scope.added.push(participant);

                    $scope.newParticipant.id = "";
                };

                /**
                 * Method to cancel the modal
                 */
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

                /**
                 * Method to save the modified participants lists.
                 * Adding and removing are separate operations so we fire off both requests (depending on what changes are made) and wait for them to both complete.
                 */
                $scope.save = function () {

                    var promises = [];

                    // if any participants were added in the UI, then update the conversation ...
                    if ($scope.added.length > 0) {
                        promises.push(comapiService.addParticipantsToConversation($scope.conversationInfo.id, $scope.added));
                    }

                    // if any participants were removed in the UI, then update the conversation ...
                    if ($scope.removed.length > 0) {
                        promises.push(comapiService.deleteParticipantsFromConversation($scope.conversationInfo.id, $scope.removed));
                    }

                    // wait for all to resolve prior to cloing the modal.
                    Promise.all(promises).then(function () {
                        $uibModalInstance.close($scope.conversationInfo);
                    });

                };

            }]);
})(window.angular);
