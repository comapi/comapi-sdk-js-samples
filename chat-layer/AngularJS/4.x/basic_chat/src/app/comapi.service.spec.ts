import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComapiService } from './comapi.service';
import { AuthService } from './auth.service';
import { MemoryConversationStore } from '@comapi/sdk-js-chat';


describe('ComapiService', () => {

  function ConversationStoreServiceFactory() {
    return new MemoryConversationStore();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [ComapiService, AuthService, {
        provide: "ConversationStoreService",
        useFactory: ConversationStoreServiceFactory
      }]
    });
  });

  it('should ...', inject([ComapiService], (service: ComapiService) => {
    expect(service).toBeTruthy();
  }));
});
