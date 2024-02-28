import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(
    public url: DataService,
    private http: HttpClient,
    private router: Router,
    private storage: Storage,
    private platform: Platform
  ) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
  }

  logout() {
    this.storage['remove']('member').then(() => {
      this.storage.clear();
      this.router.navigateByUrl('/login');
    });
    this.url.presentToast('Logout Successfully.');
  }

}
