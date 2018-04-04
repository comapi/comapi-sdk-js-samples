import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

import { ComapiService } from "./comapi.service"

@Injectable()
export class ConversationInfoResolver implements Resolve<any>   {

    constructor(private _comapiService: ComapiService) { }

    resolve(route: ActivatedRouteSnapshot) {

        return this._comapiService.initialise()
            .then(result => {
                return this._comapiService.getConversationInfo(route.params['id'])
            })
    }


}
