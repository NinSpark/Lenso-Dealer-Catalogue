import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterDealerDialog } from './register-dealer-dialog';

describe('RegisterDealerDialog', () => {
  let component: RegisterDealerDialog;
  let fixture: ComponentFixture<RegisterDealerDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterDealerDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterDealerDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
