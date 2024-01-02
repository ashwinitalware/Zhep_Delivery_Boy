import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  switchTab = 'order';

  constructor() { }

  segmentChanged(ev: any) {
    this.switchTab = ev.detail.value;
    console.log('Segment changed', ev);
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
  }

}
