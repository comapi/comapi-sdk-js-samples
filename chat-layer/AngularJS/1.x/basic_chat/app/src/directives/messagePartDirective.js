(function (angular) {
    'use strict';

    angular.module('compapiChat')
        /**
         *
         */
        .directive('messagePart', [function () {

            var controller = ['$scope',
                function ($scope) {

                    console.log("mime-message-part", $scope.part);

                    // split the type field so we can switch ...
                    var _type = $scope.part.type || "text/plain";
                    var split = _type.split('/');

                    $scope.type = split[0];
                    $scope.subType = split[1];

                    $scope.attachment = getAttachmentLink();

                    /**
                     * If we have a url, use it else if the attachment is inline, build a data url
                     */
                    function getAttachmentLink() {
                        if ($scope.part.url) {
                            return $scope.part.url;
                        } else if ($scope.part.data) {
                            return "data:" + $scope.part.type + ";base64," + $scope.part.data;
                        } else {
                            return "";
                        }
                    };


                }];

            return {
                restrict: 'EA',
                templateUrl: "src/directives/messagePart.html",
                controller: controller,
                scope: {
                    part: '=',
                },
            };

        }]);
})(window.angular);
