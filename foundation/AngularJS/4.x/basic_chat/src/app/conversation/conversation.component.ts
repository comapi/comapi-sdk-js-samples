import { Component, OnInit, OnDestroy, Input, AfterViewChecked, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';


import { IConversationDetails, IConversationMessage, IMessageSentPayload, IConversationDeletedEventData, IParticipantAddedEventData, IConversationParticipant } from '@comapi/sdk-js-foundation';

import { ComapiService } from "../comapi.service"
import { AuthService } from "../auth.service"

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
/**
 * Component to display a particular conversation
 */
export class ConversationComponent implements OnInit {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  private conversationId: string;
  public messages: IConversationMessage[];
  public conversation: IConversationDetails;
  public participants: IConversationParticipant[];

  private profileId = this._authService.getProfileId();

  public message: any = {
    body: undefined
  };

  private conversationMessageSentSubscription: Subscription;
  private conversationDeletedSubscription: Subscription;
  private participantAddedSubscription: Subscription;


  constructor(private _modalService: NgbModal,
    private _router: Router,
    private _route: ActivatedRoute,
    private _comapiService: ComapiService,
    private _authService: AuthService,
    private _toastr: ToastsManager,
    private _vcr: ViewContainerRef) {
    this._toastr.setRootViewContainerRef(_vcr);
  }


  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  private ngAfterViewChecked() {
    this.scrollToBottom();
  }

  public ngOnInit() {
    console.log("ConversationComponent.ngOnInit()");

    this._route.params.subscribe(params => {
      this.conversationId = params['id'];

      // Load the conversation details
      this._comapiService.getConversation(this.conversationId)
        .then((conversation) => {
          this.conversation = conversation;
          // load the conversation participants
          return this._comapiService.getParticipantsInConversation(this.conversationId);
        })
        .then(participants => {
          this.participants = participants;
          // load the last page of messages for this conversation 
          return this._comapiService.getConversationMessages(this.conversationId);
        })
        .then((messages) => {
          this.messages = messages.reverse();

          /**
           * Subscribe to ConversationMessageSent - if the message is from this conversation, add it to the list
           * If it is for another conversation, render a toast containing a link to that conversation
           */
          this.conversationMessageSentSubscription = this._comapiService.subscribeToConversationMessageSent((message: IMessageSentPayload) => {
            console.log("ConversationMessageSent", message);

            if (message.context.conversationId === this.conversationId) {
              this.messages.push(message);
            } else {
              let html = `<span>New message in another <a href="/conversation/${message.context.conversationId}">conversation</a> ...</span>`;
              this._toastr.info(html, '🤡', { enableHTML: true });
            }
          });

          /**
           * Subscribe to conversationDeleted  
           */
          this.conversationDeletedSubscription = this._comapiService.subscribeToConversationDeleted((data: IConversationDeletedEventData) => {
            console.log("conversationDeleted in ConversationComponent", data);
          });

          /**
           * Subscribe to participantAdded  
           */
          this.participantAddedSubscription = this._comapiService.subscribeToParticipantAdded((data: IParticipantAddedEventData) => {
            console.log("participantAdded", data);
            // if this is me, display a toast to notify the user of a new conversation
            if (data.profileId === this.profileId) {
              let html = `<span>You have been added to a <a href="/conversation/${data.conversationId}">conversation</a> ...</span>`;
              this._toastr.info(html, '🤡', { enableHTML: true });
            }
          });

        })
        // Someting went wrong ? - redirect to the error page
        .catch(error => {
          this._router.navigate(['/error', JSON.stringify(error)]);
        });
    });

  }

  /**
   * Unsubscribe from our event subscriptions when the view is destroyed
   */
  public ngOnDestroy() {
    console.log("ConversationComponent.OnDestroy()");
    if (this.conversationMessageSentSubscription) {
      this.conversationMessageSentSubscription.unsubscribe();
    }
    if (this.conversationDeletedSubscription) {
      this.conversationDeletedSubscription.unsubscribe();
    }
    if (this.participantAddedSubscription) {
      this.participantAddedSubscription.unsubscribe();
    }

  }


  /**
   * Function to send a message (and clear the textbox on success)
   */
  public sendMessage() {
    if (this.message.body) {
      this._comapiService.sendMessage(this.conversationId, this.message.body)
        .then(result => {
          console.log("sendMessage() succeeded", result);
          this.message.body = "";
        });
    }
  }

  /**
   * Function to delete this conversation and navigate back to the list view
   */
  public deleteConversation() {
    this._comapiService.deleteConversation(this.conversationId)
      .then(succeeded => {
        this._router.navigate(['/conversations']);
      });
  }

  /**
   * Function to disply the manage participants dialog
   */
  public manageParticipants() {

    this._comapiService.getParticipantsInConversation(this.conversationId)
      .then((participants) => {
        console.log("getParticipantsInConversation() =>", participants);

        let conversationInfo = {
          id: this.conversationId,
          participants: participants
        }

        const modalRef = this._modalService.open(ManageParticipantsModal);

        modalRef.componentInstance.conversationInfo = conversationInfo;

        modalRef.result
          .then(result => {
            console.log("result", result);
          }).catch(reason => {
            console.log("reason", reason);
          });

      });
  }

}


@Component({
  selector: 'manage-participants-modal',
  templateUrl: './manage-participants-modal.html',
})
/**
 * Component to manage the participants of this conversation
 * The current participants are passed in and any modifications are made when the user presses the save button within this component.
 */
export class ManageParticipantsModal {

  @Input() conversationInfo;

  // array of participants to add 
  added = [];
  // array of participants to remove 
  removed = [];

  newParticipant = {
    role: "participant",
    id: ""
  }

  constructor(public activeModal: NgbActiveModal, private _comapiService: ComapiService) { }

  /**
   * Method to remove a participant from the participants list 
   */
  removeParticipant(id) {

    var index = -1;

    for (let i = 0; i < this.conversationInfo.participants.length; i++) {
      let participant = this.conversationInfo.participants[i];

      if (participant.id === id) {
        index = i;
        this.removed.push(participant.id);
      }
    }

    this.conversationInfo.participants.splice(index, 1);
  };

  /**
   * Method to add a participant from the participants list 
   */
  addParticipant() {

    var participant = {
      id: this.newParticipant.id,
      role: this.newParticipant.role
    };

    this.conversationInfo.participants.push(participant);
    this.added.push(participant);

    this.newParticipant.id = "";
    this.newParticipant.role = "participant";
  };


  /**
   * Method to cancel the modal
   */
  cancel() {
    this.activeModal.dismiss('cancelled');
  }


  /**
   * Method to save the modified participants lists.
   * Adding and removing are separate operations so we fire off both requests (depending on what changes are made) and wait for them to both complete.
   */
  save() {

    let promises = [];

    // if any participants were added in the UI, then update the conversation ...
    if (this.added.length > 0) {
      promises.push(this._comapiService.addParticipantsToConversation(this.conversationInfo.id, this.added));
    }

    // if any participants were removed in the UI, then update the conversation ...
    if (this.removed.length > 0) {
      promises.push(this._comapiService.deleteParticipantsFromConversation(this.conversationInfo.id, this.removed));
    }

    // wait for all to resolve prior to cloing the modal.
    Promise.all(promises)
      .then(() => {
        this.activeModal.close();
      });
  }
}
