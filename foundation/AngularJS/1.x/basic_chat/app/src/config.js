(function (angular) {
    'use strict';

    /**
     * App config constants ...
     */
    angular.module('compapiChat')
        .constant("appConfig", {
            // your API space 
            apiSpaceId: ">>> ENTER API SPACE ID HERE <<<",
            //Number of messages to retrieve for a conversation (last n)
            messagePageSize: 50
        });

})(window.angular);
