import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {

  let routerStub = {
    navigate: jasmine.createSpy('navigate')
  };


  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuard, AuthService, { provide: Router, useValue: routerStub }]
    });
  });

  it('should initialise', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('should return false with no profileId', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard.canActivate(<any>{}, <any>{})).toBeFalsy();
    expect(routerStub.navigate).toHaveBeenCalled();
  }));

  it('should return true with a profileId', inject([AuthGuard, AuthService], (guard: AuthGuard, auth: AuthService) => {
    auth.setProfileId("TestProfileId");
    expect(guard.canActivate(<any>{}, <any>{})).toBeTruthy();
    auth.clearProfileId();
  }));


});
