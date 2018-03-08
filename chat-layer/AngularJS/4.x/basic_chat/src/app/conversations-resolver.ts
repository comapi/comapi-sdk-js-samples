
import { Injectable, Injector } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

import { ComapiService } from "./comapi.service"
import { IConversationStore } from '@comapi/sdk-js-chat';


@Injectable()
export class ConversationsResolver implements Resolve<any>  {

    private _conversationStore: IConversationStore;

    constructor(private _comapiService: ComapiService, private _injector: Injector) {
        this._conversationStore = this._injector.get("ConversationStoreService");
    }

    resolve(route: ActivatedRouteSnapshot) {

        return this._comapiService.initialise()
            .then(result => {
                return this._conversationStore.getConversations();
            });
    }
}
