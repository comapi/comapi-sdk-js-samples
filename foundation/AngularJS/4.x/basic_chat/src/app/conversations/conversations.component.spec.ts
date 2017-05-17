import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { ConversationsComponent } from './conversations.component';

import { PrettyDatePipe } from './../pretty-date.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from './../auth.service';
import { ComapiService } from './../comapi.service';

describe('ConversationsComponent', () => {
  let component: ConversationsComponent;
  let fixture: ComponentFixture<ConversationsComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        ToastModule.forRoot(),
        NgbModule.forRoot()
      ],
      declarations: [ConversationsComponent, PrettyDatePipe],
      providers: [ComapiService, AuthService]

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
