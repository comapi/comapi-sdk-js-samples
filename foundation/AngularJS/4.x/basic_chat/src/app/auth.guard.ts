import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthService } from "./auth.service";

@Injectable()
/**
 * This class is used in conjunction with the router to decide whether a particulat route can be activated.
 * The conversation list and detail views require a Comapi session so we check to see if we have collected a profileId.
 * If this AuthGuard is so=pecified in a canActivate property and we don't have a profileId, we redirect to the login page
 */
export class AuthGuard implements CanActivate {

  constructor(private _authService: AuthService, private _router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    let profileId = this._authService.getProfileId();

    if (profileId === null) {
      this._router.navigate(['/login']);
      return false;
    } else {
      return true;
    }
  }
}
