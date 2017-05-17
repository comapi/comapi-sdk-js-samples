import { Component, Input, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';


import { ComapiService } from "../comapi.service"
import { AuthService } from "../auth.service"


import { ConversationBuilder, IConversationDetails, IParticipantAddedEventData, IParticipantRemovedEventData, IConversationDeletedEventData, IMessageSentPayload } from '@comapi/sdk-js-foundation';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css']
})
/**
 * Component to display a list of conversations: in ngOnInit we retrieve a list of conversations that the user is a member of
 * and subscribe to variuos events. The view renders this list and allows the user to drill down into a conversation.
 */
export class ConversationsComponent implements OnInit {

  // List of conversations that the logged on user is a member of
  public conversations: IConversationDetails[];

  // The profileId of the logged on user
  public profileId = this._authService.getProfileId();


  // event subscriptions
  private conversationMessageSentSubscription: Subscription;
  private participantAddedSubscription: Subscription;
  private participantRemovedSubscription: Subscription;
  private conversationDeletedSubscription: Subscription;


  constructor(private _modalService: NgbModal,
    private _router: Router,
    private _comapiService: ComapiService,
    private _authService: AuthService,
    private _toastr: ToastsManager,
    private _vcr: ViewContainerRef) {
    this._toastr.setRootViewContainerRef(_vcr);
  }

  /**
   * Initialise this component
   */
  ngOnInit() {
    console.log("ConversationsComponent.ngOnInit()");

    this._comapiService.getConversations()
      .then(conversations => {
        this.conversations = conversations;

        /**
         * Subscribe to participantAdded event.
         */
        this.participantAddedSubscription = this._comapiService.subscribeToParticipantAdded((data: IParticipantAddedEventData) => {
          console.log("participantAdded", data);
          // A participant has been added to a conversation
          // if this is me, we need to add this conversation to the list.
          //  - this could be me creating on this device or on another device
          if (data.profileId === this.profileId) {
            this._addConversation(data.conversationId);
          }
        });

        /**
         * Subscribe to participantRemoved event.
         */
        this.participantRemovedSubscription = this._comapiService.subscribeToParticipantRemoved((data: IParticipantRemovedEventData) => {
          console.log("participantRemoved", data);
          // A participant has been removed from a conversation.
          // if this is me, need to remove this conversation.
          if (data.profileId === this.profileId) {
            this._removeConversation(data.conversationId);
          }
        });

        /**
         * Subscribe to conversationDeleted event.
         */
        this.conversationDeletedSubscription = this._comapiService.subscribeToConversationDeleted((data: IConversationDeletedEventData) => {
          console.log("conversationDeleted in ConversationsComponent", data);
          // a conversation has been deleted, remove it from our list.
          this._removeConversation(data.conversationId);
        });

        /**
         * Subscribe to ConversationMessageSent event.
         */
        this.conversationMessageSentSubscription = this._comapiService.subscribeToConversationMessageSent((message: IMessageSentPayload) => {
          console.log("ConversationMessageSent", message);
          // A new message has been sent to a conversation that this user is part of
          // Display a toast notification with a link to the conversation
          let html = `<span>New message in <a href="/conversation/${message.context.conversationId}">conversation</a> ...</span>`;
          this._toastr.info(html, '🤡', { enableHTML: true });
        });

      })
      // Someting went wrong ? - redirect to the error page      
      .catch(error => {
        this._router.navigate(['/error', JSON.stringify(error)]);
      });
  }

  /**
   * unsubscribe from all event handler when the view is destroyed
   */
  public ngOnDestroy() {
    console.log("ConversationsComponent.OnDestroy()");

    if (this.participantAddedSubscription) {
      this.participantAddedSubscription.unsubscribe();
    }

    if (this.participantRemovedSubscription) {
      this.participantRemovedSubscription.unsubscribe();
    }

    if (this.conversationDeletedSubscription) {
      this.conversationDeletedSubscription.unsubscribe();
    }

    if (this.conversationMessageSentSubscription) {
      this.conversationMessageSentSubscription.unsubscribe();
    }
  }



  /**
   * Reomve a conversation from the list of conversations
   * @param conversationId 
   */
  private _removeConversation(conversationId) {
    for (var i = 0; i < this.conversations.length; i++) {
      if (this.conversations[i].id == conversationId) {
        this.conversations.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Add a conversation from the list of conversations
   * @param conversationId 
   */
  private _addConversation(conversationId) {
    this._comapiService.getConversation(conversationId)
      .then((conversationInfo) => {
        this.conversations.push(conversationInfo);
      });
  }

  /**
   * Display the create conversation modal dialog and create the conversation if the user clicks OK.
   * We will rely on the arrival of a participantAdded event to physically add the conversation into our list
   */
  public createConversation() {
    const modalRef = this._modalService.open(ManageConversationModal);
    modalRef.componentInstance.conversation = new ConversationBuilder();

    modalRef.result
      .then(conversation => {
        console.log("conversation", conversation);

        this._comapiService.createConversation(conversation);

      }).catch(reason => {
        console.log("reason", reason);
      });
  }

}


@Component({
  selector: 'manage-conversation-modal',
  template: `
  <form #f="ngForm" class="form-horizontal" >  
    <div class="modal-header">
      <h4 class="modal-title">Create a conversation</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">

        <p>This dialog enables you to create a conversation. You must enter a name and description in the form below. There are other settings that can be set - for the purpose of keeping this demp simple, we will use the defaults. See documentation for details. </p>

        <div class="form-group" >
            <label class="col-sm-2 control-label">Name</label>
            <div class="col-sm-10">
            <input type="text" class="form-control" placeholder="Enter a name ..." name="name" [(ngModel)]="conversation.name" required>
            </div>
        </div>

        <div class="form-group" >
            <label class="col-sm-2 control-label">Description</label>
            <div class="col-sm-10">
            <input type="text" class="form-control" placeholder="Enter a description ..." name="description" [(ngModel)]="conversation.description" required>
            </div>
        </div>

    </div>
    <div class="modal-footer">
      <button class="btn btn-warning" type="button" (click)="cancel()">Cancel</button>    
      <button type="button" class="btn btn-primary" (click)="ok()" [disabled]="!f.valid">Create</button>
    </div>
</form>`
})
export class ManageConversationModal {

  @Input() conversation: IConversationDetails;

  constructor(public activeModal: NgbActiveModal) { }

  cancel() {
    this.activeModal.dismiss('cancelled');
  }


  ok() {
    this.activeModal.close(this.conversation);
  }
}