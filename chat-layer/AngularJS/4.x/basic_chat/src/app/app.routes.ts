import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { ConversationsComponent } from './conversations/conversations.component';
import { ConversationComponent } from './conversation/conversation.component';
import { ErrorComponent } from './error/error.component';
import { AuthGuard } from "./auth.guard";
import { ConversationsResolver } from "./conversations-resolver";
import { ConversationInfoResolver } from "./conversation-info-resolver";

/**
 * Application routing - some routes are protected by AuthGuard ...
 */
export const AppRoutes: Routes = [
    {
        path: "",
        redirectTo: "conversations",
        pathMatch: "full"
    },
    {
        path: 'error/:data',
        component: ErrorComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'conversations',
        component: ConversationsComponent,
        canActivate: [AuthGuard],
        resolve: {
            conversations: ConversationsResolver
        }
    },
    {
        path: 'conversation/:id',
        component: ConversationComponent,
        canActivate: [AuthGuard],
        resolve: {
            conversationInfo: ConversationInfoResolver
        }

    },
];