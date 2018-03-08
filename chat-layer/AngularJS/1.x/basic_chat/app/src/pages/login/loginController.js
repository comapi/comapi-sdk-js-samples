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
                    comapiService.uninitialise()
                        .then(function (succeeded) {
                            console.log("uninitialise succeeded", succeeded);
                        }).catch(function (error) {
                            console.log("uninitialise failed", error);
                        });
                }

            }]);

})(window.angular);
