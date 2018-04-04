import { Component, OnInit, OnDestroy, Input, AfterViewChecked, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';


import { IChatConversationInfo } from '@comapi/sdk-js-chat';

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
  public conversationInfo: IChatConversationInfo;

  private profileId = this._authService.getProfileId();

  public message: any = {
    body: undefined
  };


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
    this.conversationInfo = this._route.snapshot.data['conversationInfo'];

    this._route.params.subscribe(params => {
      this.conversationId = params['id'];
    });

  }

  /**
   * Unsubscribe from our event subscriptions when the view is destroyed
   */
  public ngOnDestroy() {
    console.log("ConversationComponent.OnDestroy()");
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
   * Function to display the manage participants dialog
   */
  public manageParticipants() {

    let conversationInfo = {
      id: this.conversationId,
      participants: this.conversationInfo.participants
    }

    const modalRef = this._modalService.open(ManageParticipantsModal);

    modalRef.componentInstance.conversationInfo = conversationInfo;

    modalRef.result
      .then(result => {
        console.log("result", result);
      }).catch(reason => {
        console.log("reason", reason);
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
