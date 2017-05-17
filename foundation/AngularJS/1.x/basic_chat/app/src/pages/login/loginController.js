(function (angular) {
    'use strict';

    angular.module('compapiChat')
        .controller('loginController', ["$scope", "$state", "authService", "comapiService",
            function ($scope, $state, authService, comapiService) {

                $scope.currentProfileId = authService.getProfileId();
                $scope.user = {};

                /**
                 * 
                 */
                $scope.login = function () {
                    authService.setProfileId($scope.user.profileId);
                    $state.transitionTo("conversations");
                }

                /**
                 * 
                 */
                $scope.logout = function () {
                    authService.clearProfileId();
                    $scope.currentProfileId = null;
                    comapiService.endSession()
                        .then(function (succeeded) {
                            console.log("endSession succeeded", succeeded);
                        }).catch(function (error) {
                            console.log("endSession failed", error);
                        });
                }

            }]);

})(window.angular);
