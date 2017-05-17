(function (angular) {
    'use strict';

    angular.module('compapiChat')
        /**
         * Controller to manage displaying create conversation modal 
         */
        .controller('manageConversationCtrl', ['$scope', '$uibModalInstance',
            function ($scope, $uibModalInstance) {

                $scope.conversation = new COMAPI.ConversationBuilder();

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

                $scope.create = function () {
                    $uibModalInstance.close($scope.conversation);
                };
            }]);

})(window.angular);
