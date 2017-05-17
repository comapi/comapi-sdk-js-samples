import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from "../auth.service";
import { ComapiService } from "../comapi.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public currentProfileId: string;

  public user: any = {
    profileId: undefined
  };

  constructor(private _router: Router, private _authService: AuthService, private _comapiService: ComapiService) { }

  ngOnInit() {
    this.currentProfileId = this._authService.getProfileId();
  }

  public login() {
    console.log("user", this.user);
    if (this.user.profileId) {
      this._authService.setProfileId(this.user.profileId);
      this._router.navigate(["/conversations"]);
    }
  }

  public logout() {

    this._authService.clearProfileId();
    this.currentProfileId = null;

    this._comapiService.endSession()
      .then(function (succeeded) {
        console.log("endSession succeeded", succeeded)
      }).catch(error => {
        console.log("endSession failed", error)
      });
  }


}
