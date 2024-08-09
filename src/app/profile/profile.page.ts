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
  user_id1: any;
  name: any;
  email: any;

  constructor(
    public url: DataService,
    private http: HttpClient,
    private router: Router,
    private storage: Storage,
    private platform: Platform
  ) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
    this.get_delivery_info();
  }

  logout() {
    this.storage['remove']('member').then(() => {
      this.storage.clear();
      this.router.navigateByUrl('/login');
    });
    this.url.presentToast('Logout Successfully.');
  }

  get_delivery_info() {
    this.storage.get('delivery').then((res1) => {
      this.user_id1 = parseInt(res1.delivery_id, 10);
      // alert(this.user_id1);
      this.url.presentLoading();
      this.url.dismiss();
      this.http
        .get(`${this.url.serverUrl}get_delivery_boy_info?id=${this.user_id1}`)
        .subscribe(
          (res: any) => {
            if (res === 0) {
              this.url.presentToast('You Have no Profile.');
            } else {
              console.log(res,40);
              this.name = res.data.name;
              this.email = res.data.email;
              console.log(this.name, 68);
              // this.Restro_Name = res.data[0].Restro_Name;
              // this.Contact_No = res.data[0].Contact_No;
            }
          },
          (err) => {
          }
        );
    });
  }

}
