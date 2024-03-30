import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapPagePage } from './map-page.page';

describe('MapPagePage', () => {
  let component: MapPagePage;
  let fixture: ComponentFixture<MapPagePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MapPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
