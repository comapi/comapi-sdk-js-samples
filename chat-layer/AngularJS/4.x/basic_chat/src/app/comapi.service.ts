import { Injectable, Injector } from '@angular/core';
import { Subject } from "rxjs/Subject"
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from "./auth.service";

import { IAuthChallengeOptions, ContentData } from '@comapi/sdk-js-foundation';
import { ComapiChatClient, ComapiChatConfig } from '@comapi/sdk-js-chat';

import { AppSettings } from "./app.settings";

/**
 * Service to encapsulate Comapi sdk and provide messaging functionality to the app.
 * Key Features:
 *  - Sdk initialisation and authentication are managed internally here - app can just call the method they require and the requested result will be returned via a promise.
 *  - Comapi events are wrapped in Observables to fit in with angular framework and to mitigate against any race conditions with subscribing before sdk is initialised. 
 */
@Injectable()
export class ComapiService {

  private chatClient: ComapiChatClient;
  private comapiConfig: ComapiChatConfig;

  constructor(private _authService: AuthService/*, private _conversationStore: ConversationStoreService*/, private _injector: Injector) {

    this.comapiConfig = new ComapiChatConfig()
      .withStore(_injector.get("ConversationStoreService"))
      .withApiSpace(AppSettings.API_SPACE_ID)
      .withAuthChallenge(this.authChallenge.bind(this))
      .withUrlBase("http://local-docker-api.comapi.com:8000")
      .withWebSocketBase("ws://local-docker-api.comapi.com:8000")
      .withOrphanedEventPersistence(2/*LocalStorage*/);
  }

  /**
   * Comapi Auth Challenge
   * We use the auth service to generate a JWT to pass back to Comapi. 
   * @param options 
   * @param answerAuthenticationChallenge 
   */
  private authChallenge(options: IAuthChallengeOptions, answerAuthenticationChallenge) {

    var profileId = this._authService.getProfileId();

    if (profileId) {
      this._authService.createJwt(profileId, options.nonce)
        .then(jwt => {
          answerAuthenticationChallenge(jwt);
        });
    } else {
      answerAuthenticationChallenge(null);
    }
  }


  /**
   * Initialise the chat layer - if already initialised, do nothing.
   * This method will be called from the routing config so is conceivable that 
   * the sdk may be already initialised
   */
  public initialise(): Promise<boolean> {
    if (this.chatClient) {
      return Promise.resolve(false);
    } else {
      this.chatClient = new ComapiChatClient();
      return this.chatClient.initialise(this.comapiConfig);
    }
  }

  /**
   * Method to uninitialise the Chat layer. We will call this as part of the logging out flow.
   */
  public uninitialise(): Promise<boolean> {
    return this.chatClient.uninitialise()
      .then(function () {
        this.chatClient = undefined;
        return true;
      });
  }

  /**
   * Method to create a conversation
   */
  public createConversation(conversationInfo) {
    return this.chatClient.messaging.createConversation(conversationInfo);
  }

  /**
   * Method to get conversationInfo.
   */
  public getConversationInfo(conversationId) {
    return this.chatClient.messaging.getConversationInfo(conversationId);
  }
  /**
   * Method to delete a conversation 
   */
  public deleteConversation(conversationId) {
    return this.chatClient.messaging.deleteConversation(conversationId);
  }
  /**
   * Method to get the participants in a conversation
   */
  public getParticipantsInConversation(conversationId) {
    return this.chatClient.messaging.getParticipantsInConversation(conversationId);
  }
  /**
   * Method to add participants to a conversation
   */
  public addParticipantsToConversation(conversationId, participants) {
    return this.chatClient.messaging.addParticipantsToConversation(conversationId, participants);
  }
  /**
   * Method to delete participants from a conversation
   */
  public deleteParticipantsFromConversation(conversationId, participants) {
    return this.chatClient.messaging.deleteParticipantsFromConversation(conversationId, participants);
  }
  /**
   * Method to send a simple plain text message to a conversation
   */
  public sendMessage(conversationId, text) {
    return this.chatClient.messaging.sendTextMessage(conversationId, text);
  }
  /**
   * Method to send an attachment
   */
  public sendAttachment(conversationId, file) {

    // create a create object from a html5 File object
    var contentData = ContentData.createFromFile(file);

    // Create a message - this function will upload the file to our content service                         
    return this.chatClient.messaging.messageFromContentData(contentData)
      .then(function (message) {
        // The message object returned will contain a link to the file
        return this.chatClient.messaging.sendMessage(conversationId, message);
      });
  }
}
