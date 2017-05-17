import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComapiService } from './comapi.service';
import { AuthService } from './auth.service';


describe('ComapiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [ComapiService, AuthService]
    });
  });

  it('should ...', inject([ComapiService], (service: ComapiService) => {
    expect(service).toBeTruthy();
  }));
});
