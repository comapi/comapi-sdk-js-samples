import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { AuthService } from './auth.service';
import { ComapiService } from './comapi.service';
import { AuthGuard } from "./auth.guard";

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ConversationsComponent, ManageConversationModal } from './conversations/conversations.component';
import { ConversationComponent, ManageParticipantsModal } from './conversation/conversation.component';
import { PrettyDatePipe } from './pretty-date.pipe';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ErrorComponent } from './error/error.component';

import { AppRoutes } from './app.routes'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ConversationsComponent,
    ConversationComponent,
    PrettyDatePipe,
    ManageConversationModal,
    ManageParticipantsModal,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    ToastModule.forRoot(),
    RouterModule.forRoot(AppRoutes),
    NgbModule.forRoot()
  ],
  providers: [AuthService, AuthGuard, ComapiService],
  entryComponents: [ManageConversationModal, ManageParticipantsModal],
  bootstrap: [AppComponent]
})
export class AppModule { }
