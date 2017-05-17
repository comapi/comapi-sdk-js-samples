(function (angular) {
    'use strict';

    angular.module('compapiChat')
        .controller('errorController', ["$scope", "$stateParams",
            function ($scope, $stateParams) {
                $scope.message = JSON.parse($stateParams.data);
            }]);

})(window.angular);
