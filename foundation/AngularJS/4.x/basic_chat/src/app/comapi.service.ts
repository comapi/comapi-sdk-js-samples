import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject"
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from "./auth.service";
import { Foundation, MessageBuilder, ComapiConfig, IAuthChallengeOptions, IConversationDetails, IConversationDetails2, IConversationMessage, ISendMessageResult, IConversationParticipant } from '@comapi/sdk-js-foundation';
import { AppSettings } from "./app.settings";

/**
 * Service to encapsulate Comapi sdk and provide messaging functionality to the app.
 * Key Features:
 *  - Sdk initialisation and authentication are managed internally here - app can just call the method they require and the requested result will be returned via a promise.
 *  - Comapi events are wrapped in Observables to fit in with angular framework and to mitigate against any race conditions with subscribing before sdk is initialised. 
 */
@Injectable()
export class ComapiService {

  private comapiSDK: Foundation;
  private comapiConfig: ComapiConfig;

  /**
   * Subjects to channel Comapi events into
   */
  private participantAddedSubject = new Subject();
  private participantRemovedSubject = new Subject();
  private conversationMessageSubject = new Subject();
  private conversationDeletedSubject = new Subject();

  constructor(private _authService: AuthService) {

    this.comapiConfig = new ComapiConfig()
      .withApiSpace(AppSettings.API_SPACE_ID)
      .withAuthChallenge(this.authChallenge.bind(this));
  }

  /**
   * Method to allow client(s) to subscribe to ParticipantAdded event
   * @param handler 
   */
  public subscribeToParticipantAdded(handler: (value: any) => void): Subscription {
    return this.participantAddedSubject.subscribe(data => {
      handler(data);
    });
  }

  /**
   * Method to allow client(s) to subscribe to ParticipantRemoved event
   * @param handler 
   */
  public subscribeToParticipantRemoved(handler: (value: any) => void): Subscription {
    return this.participantRemovedSubject.subscribe(data => {
      handler(data);
    });
  }

  /**
   * Method to allow client(s) to subscribe to ConversationMessageSent event
   * @param handler 
   */
  public subscribeToConversationMessageSent(handler: (value: any) => void): Subscription {
    return this.conversationMessageSubject.subscribe(data => {
      handler(data);
    });
  }

  /**
   * Method to allow client(s) to subscribe to ConversationDeleted event
   * @param handler 
   */
  public subscribeToConversationDeleted(handler: (value: any) => void): Subscription {
    return this.conversationDeletedSubject.subscribe(data => {
      handler(data);
    });
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
   * Internal method to wire up Comapi events to Subjects
   */
  private subscribeToComapiEvents() {
    this.comapiSDK.on("participantAdded", event => {
      this.participantAddedSubject.next(event);
    });

    this.comapiSDK.on("participantRemoved", event => {
      this.participantRemovedSubject.next(event);
    });

    this.comapiSDK.on("conversationMessageEvent", event => {
      console.log("got a conversationMessageEvent", event);
      if (event.name === "conversationMessage.sent") {
        this.conversationMessageSubject.next(event.payload);
      }
    });

    this.comapiSDK.on("conversationDeleted", event => {
      this.conversationDeletedSubject.next(event);
    });

  }

  /**
   * Internal method to retrieve sdk instance (initialising if necessary)
   */
  private getSdk(): Promise<Foundation> {
    if (this.comapiSDK) {
      return Promise.resolve(this.comapiSDK);
    } else {
      return Foundation.initialise(this.comapiConfig)
        .then((result) => {
          this.comapiSDK = result;
          this.subscribeToComapiEvents();
          return this.comapiSDK;
        });
    }
  }


  /**
   * Method to get a list of conversations user is participating in
   */
  public getConversations(): Promise<IConversationDetails2[]> {
    return this.getSdk()
      .then((comapi) => {
        return comapi.services.appMessaging.getConversations();
      });
  }

  /**
   * Method to create a conversation
   */
  public createConversation(conversationDetails: IConversationDetails): Promise<IConversationDetails2> {
    return this.getSdk()
      .then((comapi) => {
        return comapi.services.appMessaging.createConversation(conversationDetails);
      });
  }


  /**
   * Method to get a conversation
   */
  public getConversation(conversationId: string): Promise<IConversationDetails2> {
    return this.getSdk()
      .then((comapi) => {
        return comapi.services.appMessaging.getConversation(conversationId);
      });
  }

  /**
   * Method to delete a conversation 
   */
  public deleteConversation(conversationId: string): Promise<boolean> {
    return this.getSdk()
      .then((comapi) => {
        return comapi.services.appMessaging.deleteConversation(conversationId);
      });
  }


  /**
   * Method to get the participants in a conversation
   */
  public getParticipantsInConversation(conversationId: string): Promise<IConversationParticipant[]> {
    return this.getSdk()
      .then((comapi) => {
        return comapi.services.appMessaging.getParticipantsInConversation(conversationId);
      });
  }

  /**
   * Method to add participants to a conversation
   */
  public addParticipantsToConversation(conversationId: string, participants: IConversationParticipant[]): Promise<boolean> {
    return this.getSdk()
      .then((comapi) => {
        return comapi.services.appMessaging.addParticipantsToConversation(conversationId, participants);
      });
  }

  /**
   * Method to delete participants from a conversation
   */
  public deleteParticipantsFromConversation(conversationId: string, participants: string[]): Promise<boolean> {
    return this.getSdk()
      .then((comapi) => {
        return comapi.services.appMessaging.deleteParticipantsFromConversation(conversationId, participants);
      });
  }

  /**
   * Method to get a page of messages from a conversation
   */
  public getConversationMessages(conversationId: string): Promise<IConversationMessage[]> {
    return this.getSdk()
      .then((comapi) => {
        return comapi.services.appMessaging.getMessages(conversationId, AppSettings.MESSAGE_PAGE_SIZE)
          .then((result) => {
            return result.messages || [];
          });
      });
  }

  /**
   * Method to send a simple plain text message to a conversation
   */
  public sendMessage(conversationId: string, text: string): Promise<ISendMessageResult> {
    return this.getSdk()
      .then((comapi) => {
        var message = new MessageBuilder().withText(text);
        return comapi.services.appMessaging.sendMessageToConversation(conversationId, message);
      });
  }

  /**
   * Method to end the current comapi session
   */
  public endSession(): Promise<boolean> {
    return this.getSdk()
      .then((comapi) => {
        return comapi.endSession();
      });
  }


}
