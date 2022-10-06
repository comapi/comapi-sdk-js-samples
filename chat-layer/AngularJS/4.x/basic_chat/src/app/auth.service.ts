import { Injectable } from '@angular/core';
import { KJUR } from 'jsrsasign';

@Injectable()
export class AuthService {

  constructor() { }

  /**
   * Method to create a JWT using dummy auth settings and incorporating a nonce. THis will be passed into Comapi as part of the auth flow.
   * The jsrsasign library is used to perform this task
   * This is a basic example with no authentication mechanism, Usually this would be linked to your own security system.
   * @param {profileId} profileId 
   * @param {profileId} nonce 
   * @returns {Promise<string>} - returns a jwt via a promise (using promises as a real app will probably do this asynchronously) 
   */
  public createJwt(profileId: string, nonce: string): Promise<string> {

    // Header
    let oHeader = { alg: 'HS256', typ: 'JWT' };
    // Payload
    let tNow = KJUR.jws.IntDate.get('now');
    let tEnd = KJUR.jws.IntDate.get('now + 1day');
    let oPayload = {
      sub: profileId,
      nonce: nonce,
      iss: "local",
      aud: "local",
      iat: tNow,
      exp: tEnd,
    };
    let sHeader = JSON.stringify(oHeader);
    let sPayload = JSON.stringify(oPayload);
    let sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, {utf8: "secret"});

    return Promise.resolve(sJWT);
  }

  /**
   * Method to retrieve the current profileId from local storage
   * @returns {string} - returns a profileId 
   */
  public getProfileId(): string {
    return localStorage.getItem("compapiChat.profileId");
  }
  /**
   * Method to set the current profileId in local storage
   * @param {profileId} profileId 
   */
  public setProfileId(profileId): void {
    localStorage.setItem("compapiChat.profileId", profileId);
  }

  /**
   * Method to clear the current profileId from local storage
   */
  public clearProfileId(): void {
    localStorage.removeItem("compapiChat.profileId");
  }

}
