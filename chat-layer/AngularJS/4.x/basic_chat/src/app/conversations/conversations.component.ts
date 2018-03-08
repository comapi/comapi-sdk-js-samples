import { Injector } from '@angular/core';
import { Component, Input, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';


import { ComapiService } from "../comapi.service"
import { AuthService } from "../auth.service"

import { ConversationBuilder, IConversationDetails, IParticipantAddedEventData, IParticipantRemovedEventData, IConversationDeletedEventData, IMessageSentPayload } from '@comapi/sdk-js-foundation';

import { IConversationStore } from '@comapi/sdk-js-chat';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css']
})
/**
 * Component to display a list of conversations: in ngOnInit we retrieve a list of conversations that the user is a member of
 */
export class ConversationsComponent implements OnInit {

  // List of conversations that the logged on user is a member of
  public conversations: IConversationDetails[];

  // The profileId of the logged on user
  public profileId = this._authService.getProfileId();

  private _conversationStore: IConversationStore;


  constructor(private _modalService: NgbModal,
    private _router: Router,
    private _route: ActivatedRoute,
    private _comapiService: ComapiService,
    private _authService: AuthService,
    private _toastr: ToastsManager,
    private _vcr: ViewContainerRef,
    private _injector: Injector) {
    this._toastr.setRootViewContainerRef(_vcr);

    this._conversationStore = _injector.get("ConversationStoreService");


  }

  /**
   * Initialise this component
   */
  ngOnInit() {
    console.log("ConversationsComponent.ngOnInit()");
    this.conversations = this._route.snapshot.data['conversations'];
  }

  /**
   * unsubscribe from all event handler when the view is destroyed
   */
  public ngOnDestroy() {
    console.log("ConversationsComponent.OnDestroy()");
  }

  /**
   * Display the create conversation modal Dialog and create the conversation if the user clicks OK.
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