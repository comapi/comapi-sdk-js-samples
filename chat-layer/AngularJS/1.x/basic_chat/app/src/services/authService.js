(function (angular) {
    'use strict';

    angular.module('compapiChat')
        .service('authService', [function () {

            var service = {

                /**
                 * Method to create a JWT using dummy auth settings and incorporating a nonce. THis will be passed into Comapi as part of the auth flow.
                 * The jsrsasign library is used to perform this task
                 * This is a basic example with no authentication mechanism, Usually this would be linked to your own security system.
                 * @param {profileId} profileId 
                 * @param {profileId} nonce 
                 * @returns {Promise<string>} - returns a jwt via a promise (using promises as a real app will probably do this asynchronously) 
                 */
                createJwt: function (profileId, nonce) {

                    // Header
                    var oHeader = { alg: 'HS256', typ: 'JWT' };
                    // Payload
                    var tNow = KJUR.jws.IntDate.get('now');
                    var tEnd = KJUR.jws.IntDate.get('now + 1day');
                    var oPayload = {
                        sub: profileId,
                        nonce: nonce,
                        iss: "local",
                        aud: "local",
                        iat: tNow,
                        exp: tEnd,
                    };
                    var sHeader = JSON.stringify(oHeader);
                    var sPayload = JSON.stringify(oPayload);
                    var sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, "secret");

                    return sJWT;
                },
                /**
                 * Method to retrieve the current profileId from local storage
                 * @returns {string} - returns a profileId 
                 */
                getProfileId: function () {
                    return localStorage.getItem("compapiChat.profileId");
                },
                /**
                 * Method to set the current profileId in local storage
                 * @param {profileId} profileId 
                 */
                setProfileId: function (profileId) {
                    localStorage.setItem("compapiChat.profileId", profileId);
                },
                /**
                 * Method to clear the current profileId from local storage
                 */
                clearProfileId: function () {
                    localStorage.removeItem("compapiChat.profileId");
                }
            };

            return service;
        }]);

})(window.angular);
