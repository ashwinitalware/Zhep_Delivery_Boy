import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DataService } from './data.service';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  Contact_No: any;
  cust_id1: any;
  user_id1: any;
  dataService: any;
  Restro_Name: any;



  constructor(
    public url: DataService,
    private http: HttpClient,
    private router: Router,
    private storage: Storage,
    private platform: Platform
  ) {
    this.initializeApp();
  }

  ionViewWillEnter() {
    this.url.presentLoading();
    this.get_delivery_info();
    this.url.dismiss();
  }

  async initializeApp() {
    this.storage.create();
    this.platform.ready().then(() => {
      this.storage.get('delivery').then(async (res) => {
        this.cust_id1 = parseInt(res.delivery_id, 10);
        this.get_delivery_info();
        if (
          this.cust_id1 !== '' &&
          this.cust_id1 !== 'undefined' &&
          this.cust_id1 !== undefined
        ) {
          //alert(this.cust_id1);
          this.router.navigate(['/dashboard']);         
        } else {
          this.router.navigate(['/login']);
        }
        // this.dataService.initPush();
      });

      this.platform.backButton.subscribeWithPriority(-1, () => {
        if (
          (window.location + '').includes('localhost/dashboard') ||
          (window.location + '').includes(
            'localhost' + this.dataService.directNavigate
          ) ||
          (window.location + '').includes('localhost/login')
        ) {
          App.exitApp();
        }
      });

      // try {
      //   const getCurrentAppVersion = async () => {
      //     const result = await AppUpdate.getAppUpdateInfo();
      //     return result.currentVersion;
      //   };

      //   const getAvailableAppVersion = async () => {
      //     const result = await AppUpdate.getAppUpdateInfo();
      //     return result.availableVersion;
      //   };

      //   const openAppStore = async () => {
      //     await AppUpdate.openAppStore();
      //   };

      //   const performImmediateUpdate = async () =>{
      //     const result = await AppUpdate.getAppUpdateInfo();
      //     if (
      //       result.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE
      //     ) {
      //       return;
      //     }
      //     if (result.immediateUpdateAllowed) {
      //       await AppUpdate.performImmediateUpdate();
      //     }
      //   };

      //   const startFlexibleUpdate = async () =>{
      //     const result = await AppUpdate.getAppUpdateInfo();
      //     if (
      //       result.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE
      //     ) {
      //       return;
      //     }
      //     if (result.flexibleUpdateAllowed) {
      //       await AppUpdate.startFlexibleUpdate();
      //     }
      //   };

      //   const completeFlexibleUpdate = async () => {
      //     await AppUpdate.completeFlexibleUpdate();
      //   };
      // } catch (error) {}
    });
  }
  update_data(arg0: string, update_data: any) {
    throw new Error('Method not implemented.');
  }

  logout() {
        this.storage.remove('delivery').then(() => {
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
              console.log(res);
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
