import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowMapPage } from './show-map.page';

describe('ShowMapPage', () => {
  let component: ShowMapPage;
  let fixture: ComponentFixture<ShowMapPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ShowMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
