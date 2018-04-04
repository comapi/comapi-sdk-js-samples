import { TestBed, inject } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService]
    });
  });

  it('should initialise', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  it('should get and set profileIds', inject([AuthService], (service: AuthService) => {
    service.setProfileId("testProfileId");
    expect(service.getProfileId()).toBe("testProfileId");
    service.clearProfileId();
    expect(service.getProfileId()).toBeNull();
  }));

  it('should initialise', inject([AuthService], async (service: AuthService) => {
    service.createJwt("testProfileId", "5398787C-2E87-4B8C-A675-080FAE9C6085")
      .then(jwt => {
        let bits = jwt.split(".");
        expect(bits.length).toBe(3);
        let header = JSON.parse(atob(bits[0]));
        let payload = JSON.parse(atob(bits[1]));
        let signature = bits[2];
        expect(payload.sub).toBe("testProfileId");
        expect(payload.nonce).toBe("5398787C-2E87-4B8C-A675-080FAE9C6085");
      });
  }));


});
