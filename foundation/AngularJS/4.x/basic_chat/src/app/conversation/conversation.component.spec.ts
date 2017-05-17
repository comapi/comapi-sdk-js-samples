import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { ConversationComponent } from './conversation.component';
import { PrettyDatePipe } from './../pretty-date.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from './../auth.service';
import { ComapiService } from './../comapi.service';


describe('ConversationComponent', () => {
  let component: ConversationComponent;
  let fixture: ComponentFixture<ConversationComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        RouterTestingModule,
        ToastModule.forRoot(),
        NgbModule.forRoot()
      ],
      declarations: [ConversationComponent, PrettyDatePipe],
      providers: [ComapiService, AuthService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
