import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  contact: any;
  user_id1: any;

  session_data = {
    contact: '',
    password: '',
  };
  
  constructor(
    private router: Router,
    private http: HttpClient,
    private storage: Storage,
    public url: DataService
  ) {}

  async ngOnInit() {
    await this.storage.create();
  }

  login_submit(f: NgForm) {
    console.log(f.value);
  
    if (f.value.contact !== '' && f.value.password !== '') {
      this.url.presentLoading();
  
      const requestData = {
        contact: f.value.contact,
        password: f.value.password
      };
  
      this.http.post(`${this.url.serverUrl}delivery_check`, requestData).subscribe(
        (res: any) => {
          console.log(res);
  
          if (res.status === false) {
            this.url.presentToast('User not Registered');
            this.dismissLoader();
          } else {
            this.session_data['contact'] = res.user.id;
            this.storage.set('delivery', this.session_data);
  
            this.url.presentToast('Login Successfully');
            // Check if the user is not registered before navigating to dashboard
            if (res.status === false) {
              this.dismissLoader();
            } else {
              this.router.navigate(['/dashboard']).then(() => {
                this.dismissLoader();
              });
            }
          }
        },
        (err) => {
          this.dismissLoader();
        }
      );
    }
  }

  // login_submit(f: NgForm) {
  //   console.log(f.value);
  
  //   if (f.value.contact !== '' && f.value.password !== '') {
  //     this.url.presentLoading();
  
  //     const requestData = {
  //       contact: f.value.contact,
  //       password: f.value.password
  //     };
  
  //     this.http.post(`${this.url.serverUrl}delivery_check`, requestData).subscribe(
  //       (res: any) => {
  //         console.log(res, 89);
  
  //         if (res.status === false) {
  //           this.url.presentToast('User not Registered');
  //           this.dismissLoader();
  //         } else {
  //           this.session_data['contact'] = res.data.id; // Update this line to access the correct user id property
  //           this.storage.set('delivery', this.session_data);
  
  //           this.url.presentToast('Login Successfully');
  //           this.router.navigate(['/dashboard']).then(() => {
  //             this.dismissLoader(); // Dismiss the loader after navigation
  //           });
  //         }
  //       },
  //       (err) => {
  //         this.dismissLoader();
  //         // Handle the error case
  //         // this.loader_visibility = false;
  //         // this.func.presentToast("Server Error. Please try after some time.");
  //       }
  //     );
  //   }
  // }
  
  dismissLoader() {
    // Dismiss the loader here
    this.url.dismiss();
  }
  

}
