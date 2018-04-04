import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { FormsModule } from '@angular/forms'
import { LoginComponent } from './login.component';
import { AuthService } from './../auth.service';
import { ComapiService } from './../comapi.service';

import { MemoryConversationStore } from '@comapi/sdk-js-chat';


describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  function ConversationStoreServiceFactory() {
    return new MemoryConversationStore();
  }


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [LoginComponent],
      providers: [AuthService, ComapiService, {
        provide: "ConversationStoreService",
        useFactory: ConversationStoreServiceFactory
      }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
