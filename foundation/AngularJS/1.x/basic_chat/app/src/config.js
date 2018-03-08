(function (angular) {
    'use strict';

    /**
     * App config constants ...
     */
    angular.module('compapiChat')
        .constant("appConfig", {
            // your API space 
            apiSpaceId: "439bc23c-e2ad-4e5d-a1af-5ca18d0d61da",
            //Number of messages to retrieve for a conversation (last n)
            messagePageSize: 50
        });

})(window.angular);
