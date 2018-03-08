(function (angular) {
    'use strict';

    /**
     * Service to encapsulate Comapi sdk and provide messaging functionality to the app.
     * Key Features:
     *  - Sdk initialisation and authentication are managed internally here - app can just call the method they require and the requested result will be returned via a promise.
     *  - Comapi events are broadcasted on $rootScope to fit in with angular framework and to mitigate against any race conditions with subscribing before sdk is initialised. 
     */
    angular.module('compapiChat')
        .factory('comapiService', ["$rootScope", "authService", "appConfig",
            function ($rootScope, authService, appConfig) {

                var _comapiSDK;

                /**
                 * Comapi Auth Challenge
                 * We use the auth service to generate a JWT to pass back to Comapi. 
                 * @param options 
                 * @param answerAuthenticationChallenge 
                 */
                function _authChallenge(options, answerAuthenticationChallenge) {

                    var profileId = authService.getProfileId();

                    if (profileId) {
                        var jwt = authService.createJwt(profileId, options.nonce);
                        answerAuthenticationChallenge(jwt);
                    } else {
                        answerAuthenticationChallenge(null);
                    }
                }

                var comapiConfig = new COMAPI.ComapiConfig()
                    .withUrlBase("http://local-docker-api.comapi.com:8000")
                    .withWebSocketBase("ws://local-docker-api.comapi.com:8000")
                    .withApiSpace(appConfig.apiSpaceId)
                    .withAuthChallenge(_authChallenge);

                /**
                 * Internal method to retrieve sdk instance (initialising if necessary)
                 */
                function _getSdk() {
                    if (_comapiSDK) {
                        return Promise.resolve(_comapiSDK);
                    } else {
                        return COMAPI.Foundation.initialise(comapiConfig)
                            .then(function (result) {
                                _comapiSDK = result;
                                _subscribe();
                                return _comapiSDK;
                            });
                    }
                }

                /**
                 * Subscribe to some comapi events and broadcast them on $rootScope so anyone can listen for these ...
                 */
                function _subscribe() {

                    _comapiSDK.on("conversationMessageEvent", function (event) {
                        console.log("got a conversationMessageEvent", event);
                        if (event.name === "conversationMessage.sent") {
                            $rootScope.$broadcast("conversationMessage.sent", event.payload);
                        }
                    });

                    _comapiSDK.on("participantAdded", function (event) {
                        console.log("got a participantAdded", event);
                        $rootScope.$broadcast("participantAdded", event);
                    });

                    _comapiSDK.on("participantRemoved", function (event) {
                        console.log("got a participantRemoved", event);
                        $rootScope.$broadcast("participantRemoved", event);
                    });

                    _comapiSDK.on("conversationDeleted", function (event) {
                        console.log("got a conversationDeleted", event);
                        $rootScope.$broadcast("conversationDeleted", event);
                    });

                }


                var service = {

                    /**
                     * Method to get a list of conversations user is participating in
                     */
                    getConversations: function () {
                        return _getSdk()
                            .then(function (comapi) {
                                return comapi.services.appMessaging.getConversations();
                            });
                    },
                    /**
                     * Method to create a conversation
                     */
                    createConversation: function (conversationInfo) {
                        return _getSdk()
                            .then(function (comapi) {
                                return comapi.services.appMessaging.createConversation(conversationInfo);
                            });
                    },
                    /**
                     * Method to get a conversation
                     */
                    getConversation: function (conversationId) {
                        return _getSdk()
                            .then(function (comapi) {
                                return comapi.services.appMessaging.getConversation(conversationId);
                            });
                    },
                    /**
                     * Method to delete a conversation 
                     */
                    deleteConversation: function (conversationInfo) {
                        return _getSdk()
                            .then(function (comapi) {
                                return comapi.services.appMessaging.deleteConversation(conversationInfo);
                            });
                    },
                    /**
                     * Method to get the participants in a conversation
                     */
                    getParticipantsInConversation: function (conversationId) {
                        return _getSdk()
                            .then(function (comapi) {
                                return comapi.services.appMessaging.getParticipantsInConversation(conversationId);
                            });
                    },
                    /**
                     * Method to add participants to a conversation
                     */
                    addParticipantsToConversation: function (conversationId, participants) {
                        return _getSdk()
                            .then(function (comapi) {
                                return comapi.services.appMessaging.addParticipantsToConversation(conversationId, participants);
                            });
                    },
                    /**
                     * Method to delete participants from a conversation
                     */
                    deleteParticipantsFromConversation: function (conversationId, participants) {
                        return _getSdk()
                            .then(function (comapi) {
                                return comapi.services.appMessaging.deleteParticipantsFromConversation(conversationId, participants);
                            });
                    },
                    /**
                     * Method to get a page of messages from a conversation
                     */
                    getConversationMessages: function (conversationId) {
                        return _getSdk()
                            .then(function (comapi) {
                                return comapi.services.appMessaging.getMessages(conversationId, appConfig.messagePageSize)
                                    .then(function (result) {
                                        return result.messages || [];
                                    });
                            });
                    },
                    /**
                     * Method to send a simple plain text message to a conversation
                     */
                    sendMessage: function (conversationId, text) {
                        return _getSdk()
                            .then(function (comapi) {
                                var message = new COMAPI.MessageBuilder().withText(text);
                                return comapi.services.appMessaging.sendMessageToConversation(conversationId, message);
                            });
                    },
                    /**
                     * 
                     */
                    sendAttachment: function (conversationId, fileObj) {
                        return _getSdk()
                            .then(function (comapi) {
                                var content = COMAPI.ContentData.createFromBase64(fileObj.base64, fileObj.filename, fileObj.filetype);
                                return Promise.all([comapi, comapi.services.appMessaging.uploadContent(content)]);
                            })
                            .then(function (result) {
                                var comapi = result[0];
                                var contentResult = result[1];
                                var message = new COMAPI.MessageBuilder().withURL(contentResult.type, contentResult.url, contentResult.size, contentResult.name);
                                return comapi.services.appMessaging.sendMessageToConversation(conversationId, message);
                            });
                    },
                    /**
                     * Method to end the current comapi session
                     */
                    endSession: function () {
                        return _getSdk()
                            .then(function (comapi) {
                                return comapi.endSession();
                            });
                    }
                };

                return service;
            }]);

})(window.angular);
