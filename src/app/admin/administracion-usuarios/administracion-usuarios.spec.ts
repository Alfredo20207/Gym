import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministracionUsuarios } from './administracion-usuarios';

describe('AdministracionUsuarios', () => {
  let component: AdministracionUsuarios;
  let fixture: ComponentFixture<AdministracionUsuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministracionUsuarios]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AdministracionUsuarios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
