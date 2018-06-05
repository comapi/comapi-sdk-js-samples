(function (angular) {
    'use strict';

    /**
     * Service to encapsulate Comapi Chat layer and provide messaging functionality to the app.
     * Key Features:
     *  - Sdk initialisation and authentication are managed internally here - app can just call the method they require and the requested result will be returned via a promise.
     */
    angular.module('compapiChat')
        .factory('comapiService', ["authService", "appConfig", "comapiChatStore",
            function (authService, appConfig, comapiChatStore) {

                var _chatClient;

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

                /** 
                 * This is the configuration necessary to initialise the Chat Layer 
                 */
                var comapiConfig = new COMAPI_CHAT.ComapiChatConfig()
                    .withStore(comapiChatStore)
                    .withApiSpace(appConfig.apiSpaceId)
                    .withAuthChallenge(_authChallenge)
                    .withOrphanedEventPersistence(2/*LocalStorage*/);


                var service = {

                    /**
                     * Initialise the chat layer - if already initialised, do nothing.
                     * This method will be called from the routing config so is conceivable that 
                     * the sdk may be already initialised
                     */
                    initialise: function () {
                        if (_chatClient) {
                            return Promise.resolve(true);
                        } else {
                            _chatClient = new COMAPI_CHAT.ComapiChatClient();
                            return _chatClient.initialise(comapiConfig);
                        }
                    },
                    /**
                     * Method to uninitialise the Chat layer. We will call this as part of the logging out flow.
                     */
                    uninitialise: function () {
                        return _chatClient.uninitialise()
                            .then(function () {
                                _chatClient = undefined;
                                return true;
                            });
                    },
                    /**
                     * Method to create a conversation
                     */
                    createConversation: function (conversationInfo) {
                        return _chatClient.messaging.createConversation(conversationInfo);
                    },
                    /**
                     * Method to get conversationInfo.
                     */
                    getConversationInfo: function (conversationId) {
                        return _chatClient.messaging.getConversationInfo(conversationId);
                    },
                    /**
                     * Method to delete a conversation 
                     */
                    deleteConversation: function (conversationId) {
                        return _chatClient.messaging.deleteConversation(conversationId);
                    },
                    /**
                     * Method to get the participants in a conversation
                     */
                    getParticipantsInConversation: function (conversationId) {
                        return _chatClient.messaging.getParticipantsInConversation(conversationId);
                    },
                    /**
                     * Method to add participants to a conversation
                     */
                    addParticipantsToConversation: function (conversationId, participants) {
                        return _chatClient.messaging.addParticipantsToConversation(conversationId, participants);
                    },
                    /**
                     * Method to delete participants from a conversation
                     */
                    deleteParticipantsFromConversation: function (conversationId, participants) {
                        return _chatClient.messaging.deleteParticipantsFromConversation(conversationId, participants);
                    },
                    /**
                     * Method to send a simple plain text message to a conversation
                     */
                    sendMessage: function (conversationId, text) {
                        return _chatClient.messaging.sendTextMessage(conversationId, text);
                    },
                    /**
                     * Method to send an attachment
                     */
                    sendAttachment: function (conversationId, file) {

                        // create a create object from a html5 File object
                        var contentData = COMAPI_CHAT.ContentData.createFromFile(file);

                        // Create a message - this function will upload the file to our content service                         
                        return _chatClient.messaging.messageFromContentData(contentData)
                            .then(function (message) {
                                // The message object returned will contain a link to the file
                                return _chatClient.messaging.sendMessage(conversationId, message);
                            });
                    },
                };

                return service;
            }]);

})(window.angular);
