import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonModal, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Geolocation } from '@capacitor/geolocation';

declare const google: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  currentLocation: { lat: number, lon: number } = { lat: 0, lon: 0 };
  @ViewChild('modalTrigger', { static: true }) modalTrigger!: IonModal;
  otp: any;
  deliveryorder: any;
  isDataLoaded: boolean = false;
  switchTab = 'order';
  user_id1: any;
  alldeliveryorder: any;
  session_data1: any;
  processingorder: any[] = [];
  completedorder: any;
  address: any;
  lat_lan: any;
  updateInterval: any;

  constructor(
    public url: DataService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private storage: Storage,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    await this.storage.create();
    this.getCurrentLocation();
    this.startUpdatingLocation();
  }

  ngOnDestroy() {
    // Clear the interval when the component is destroyed
    this.stopUpdatingLocation();
  }

  startUpdatingLocation() {
    this.updateInterval = setInterval(() => {
      this.getCurrentLocation();
    }, 30000); // 30000 ms = 30 seconds
  }

  stopUpdatingLocation() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  table_accepted = {
    delivery_boy_id: '',
    order_id: '',
  };

  table_cancelled = {
    order_id: '',
  }

  table_pickup = {
    order_id: '',
  }

  table_delivered = {
    order_id: '',
  }

  send_delivered = {
    order_id2: '',
  }


  segmentChanged(ev: any) {
    this.switchTab = ev.detail.value;
    console.log('Segment changed', ev);
  }

  ionViewWillEnter() {
    this.url.presentLoading();
    this.get_delivery_order();


    this.address = this.url.user_map_address;
    this.lat_lan=this.url.user_map_lat + ',' + this.url.user_map_lan;
    
    setTimeout(() => {
    // this.loader_visible = false;
    },2200)
    this.url.dismiss();
  }

  callPhoneNumberrestro(phoneNumber: string) {
    if (phoneNumber) {
      window.location.href = 'tel:' + phoneNumber;
    } else {
      console.error('Phone number not provided');
    }
  }
 
  callPhoneNumber(phoneNumber: string) {
    if (phoneNumber) {
      window.location.href = 'tel:' + phoneNumber;
    } else {
      console.error('Phone number not provided');
    }
  }
  
  get_delivery_order() {
    this.http.get(`${this.url.serverUrl}get_delivery_order?`).subscribe(
      (res: any) => {
        // alert();
        if (res.status) {
          this.alldeliveryorder = res.data;
          this.processingorder = res.data.filter((deliveryorder: any) =>
            deliveryorder.status === 'In Progress' ||
            deliveryorder.status === 'Order Accepted' ||
            deliveryorder.status === 'Order Cooking' ||
            deliveryorder.status === 'Ready for Pickup' ||
            deliveryorder.status === 'Ready for Delivery' ||
            deliveryorder.status === 'Order Delivered'

          );
          this.completedorder = this.alldeliveryorder.filter((deliveryorder: any) => deliveryorder.status === 'Order Delivered');

          this.completedorder = res.data.filter((deliveryorder: any) => deliveryorder.status === 'Completed');

          this.alldeliveryorder = res.data.filter((deliveryorder: any) => deliveryorder.status === 'Pending Delivery Boy');

          if (!this.switchTab) {
            this.switchTab = this.processingorder.length > 0 ? 'processing' : 'order';
          }
        } else {
          this.url.presentToast('You have no Order.');
        }
      },
      (err) => { }
    );
  }



  getBackgroundColor(status: string): string {
    switch (status) {
      case 'Pending Delivery Boy':
        return '#ffc409';
      case 'In Progress':
        return 'orange';
      case 'Order Accepted':
      case 'Order Cooking':
        return '#00771c';
      case 'Order is Pickup':
        return '#00771c';
      case 'Order Delivered':
        return '#00771c'
      default:
        return '#ffc409';
    }
  }


  reloadData() {
    this.isDataLoaded = false;
    this.get_delivery_order();
  }

  accept_table(order_id2: any) {
    this.storage.get('delivery').then((res1) => {
      this.user_id1 = parseInt(res1.delivery_id, 10);

      this.table_accepted['order_id'] = order_id2;
      this.table_accepted['delivery_boy_id'] = this.user_id1;

      // this.table_accepted['user_id'] = this.user_id1;
      this.url.presentLoading();
      this.http.post(`${this.url.serverUrl}delivery_accept_order`, this.table_accepted)
        .subscribe(
          (res: any) => {
            console.log(res);

            if (res.status) {
              this.url.presentToast('Your Order Table has been Accepted successfully!');
              this.moveOrderToProcessing(order_id2);
              this.switchTab = 'processing';

              this.get_delivery_order();

              this.url.dismiss();
            } else {
              this.url.presentToast('Failed to update the order status.');
              this.url.dismiss();
            }
          },
          (err) => {
            this.url.presentToast('Error updating order status.');
            this.url.dismiss();
          }
        );
    });
  }



  pickup_table(order_id2: any) {
    this.storage.get('delivery').then((res1) => {
      this.user_id1 = parseInt(res1.delivery_id, 10);
      this.table_pickup['order_id'] = order_id2;
      this.url.presentLoading();
      this.http.post(`${this.url.serverUrl}pickup_delivery_order`, this.table_pickup)
        .subscribe(
          (res: any) => {
            console.log(res);

            if (res.status) {
              this.url.presentToast('Your Order Table has been Accepted successfully!');
              this.moveOrderTocompletedorder(order_id2);
              this.switchTab = 'completed';

              this.get_delivery_order();

              this.updateDeliveryOrderStatus(order_id2, 'Order Picked Up');

              this.url.dismiss();
            } else {
              this.url.presentToast('Failed to update the order status.');
              this.url.dismiss();
            }
          },
          (err) => {
            this.url.presentToast('Error updating order status.');
            this.url.dismiss();
          }
        );
    });
  }

  updateDeliveryOrderStatus(order_id2: any, status: string) {
    const foundIndex = this.processingorder.findIndex(order => order.order_id2 === order_id2);
    if (foundIndex !== -1) {
      this.processingorder[foundIndex].status = status;
    }
  }

  delivered_table1(order_id2: any) {
    this.storage.get('delivery').then((res1) => {
      this.user_id1 = parseInt(res1.delivery_id, 10);
      this.table_delivered['order_id'] = order_id2;
      this.url.presentLoading();
      this.http.post(`${this.url.serverUrl}delivered_delivery_order`, this.table_delivered)
        .subscribe(
          (res: any) => {
            console.log(res);

            if (res.status) {
              this.url.presentToast('Your Order Table has been Accepted successfully!');
              this.moveOrderTocompletedorder(order_id2);
              this.switchTab = 'completed';

              // Reload order data after accepting the order
              this.get_delivery_order();

              this.url.dismiss();
            } else {
              this.url.presentToast('Failed to update the order status.');
              this.url.dismiss();
            }
          },
          (err) => {
            this.url.presentToast('Error updating order status.');
            this.url.dismiss();
          }
        );
    });
  }

  delivered_table(order_id2: any) {
    this.storage.get('delivery').then((res1) => {
      this.user_id1 = parseInt(res1.delivery_id, 10);
      this.table_delivered['order_id'] = order_id2;
      this.url.presentLoading();
      this.http.post(`${this.url.serverUrl}delivered_delivery_order`, this.table_delivered)
        .subscribe(
          (res: any) => {
            console.log(res);
  
            if (res.status) {
              this.url.presentToast('Your Order Table has been Accepted successfully!');
              this.moveOrderToCompleted(order_id2); // Move order to completed orders
              this.switchTab = 'completed';
  
              // Reload order data after accepting the order
              this.get_delivery_order();
  
              this.url.dismiss();
            } else {
              this.url.presentToast('Failed to update the order status.');
              this.url.dismiss();
            }
          },
          (err) => {
            this.url.presentToast('Error updating order status.');
            this.url.dismiss();
          }
        );
    });
  }

  moveOrderToProcessing(order_id: any) {
    const index = this.alldeliveryorder.findIndex((deliveryorder: any) => deliveryorder.order_id2 === order_id);
    if (index !== -1) {
      const acceptedOrder = this.alldeliveryorder.splice(index, 1)[0];
      this.processingorder.push(acceptedOrder);
      this.switchTab = 'processing';
    }
  }

  moveOrderTocompletedorder(order_id: any) {
    const index = this.alldeliveryorder.findIndex((deliveryorder: any) => deliveryorder.order_id2 === order_id);
    if (index !== -1) {
      const acceptedOrder = this.alldeliveryorder.splice(index, 1)[0];
      this.completedorder.push(acceptedOrder);
      this.switchTab = 'completed';
    }
  }

  moveOrderToCompleted(order_id: any) {
    const index = this.processingorder.findIndex((deliveryorder: any) => deliveryorder.order_id2 === order_id);
    if (index !== -1) {
      const deliveredOrder = this.processingorder.splice(index, 1)[0];
      this.completedorder.push(deliveredOrder);
    }
  }

  
  show_map_new(pickupAddress: string) {
    this.router.navigate(['/show-map'], { queryParams: { address: pickupAddress, type: 'pickup' } });
  }
  
  show_map(deliveryAddress: any) {
    if (typeof deliveryAddress === 'string') {
      deliveryAddress = JSON.parse(deliveryAddress);
    }
    const address = deliveryAddress.address_type + ', ' + deliveryAddress.house_number + ', ' + deliveryAddress.address + ', ' + deliveryAddress.landmark;
    this.router.navigate(['/map-page'], { queryParams: { address: address, type: 'delivery' } });
  }

  cancel_table(order_id2: any) {
    this.storage.get('delivery').then((res1) => {
      this.user_id1 = parseInt(res1.delivery_id, 10);
      this.table_cancelled['order_id'] = order_id2;
      this.url.presentLoading();
      this.http
        .post(`${this.url.serverUrl}cancel_order`, this.table_cancelled)
        .subscribe(
          (res: any) => {
            this.url.presentToast('Your Order has been cancelled successfully !');
            this.removeOrderFromList(order_id2); 
            this.url.dismiss();
          },
          (err) => {
            this.url.dismiss();
          }
        );
    });
  }

  removeOrderFromList(order_id: any) {
    const index = this.alldeliveryorder.findIndex((deliveryorder: any) => deliveryorder.order_id2 === order_id);
    if (index !== -1) {
      this.alldeliveryorder.splice(index, 1); 
    }
  }


  send_delivery_otp(order_id2: any) {
    this.storage.get('delivery').then((res1) => {
      this.user_id1 = parseInt(res1.delivery_id, 10);
      this.send_delivered['order_id2'] = order_id2;
      this.url.presentLoading();
      this.http.post(`${this.url.serverUrl}send_delivery_otp`, this.send_delivered)
        .subscribe(
          (res: any) => {
            console.log(res);
            this.url.dismiss();
          },
          (err) => {
            this.url.presentToast('Error updating order status.');
            this.url.dismiss();
          }
        );
    });
  }

  async verify_delivery_otp(order_id2: any, otp: number) {
    if (!otp) {
      this.url.presentToast('Please Fill OTP.');
      return;
    }

    const data = {
      order_id2: order_id2,
      otp: otp
    };

    this.http.post(`${this.url.serverUrl}verify_delivery_otp`, data)
      .subscribe(
        async (res: any) => {
          if (res.status) {
            this.deliveryorder.status = 'Order Delivered';
            await this.url.presentToast(res.message); 
            
            // Close the modal
            if (this.modalTrigger) {
              await this.modalTrigger.dismiss();
            }
          } else {
            await this.url.presentToast(res.message);
          }
        },
        async (err) => {
          await this.url.presentToast('Error verifying OTP.');
        }
      );
  }


  // async verify_delivery_otp(order_id2: any, otp: number) {
  //   if (!otp) {
  //     this.url.presentToast('Please Fill OTP.');
  //     return;
  //   }
  
  //   const data = {
  //     order_id2: order_id2,
  //     otp: otp
  //   };
  
  //   this.http.post(`${this.url.serverUrl}verify_delivery_otp`, data)
  //     .subscribe(
  //       async (res: any) => {
  //         if (res.status) {
  //           this.deliveryorder.status = 'Order Delivered';
  //           await this.url.presentToast(res.message); 
            
  //           // Close the modal
  //           if (this.modal) {
  //             await this.modal.dismiss();
  //           }
  //         } else {
  //           await this.url.presentToast(res.message);
  //         }
  //       },
  //       async (err) => {
  //         await this.url.presentToast('Error verifying OTP.');
  //       }
  //     );
  // }


  // send_delivery_otp(order_id2: any) {
  //   this.storage.get('delivery').then((res1) => {
  //     this.user_id1 = parseInt(res1.delivery_id, 10);
  //     this.send_delivered['order_id2'] = order_id2;
  //     this.url.presentLoading();
  //     this.http.post(`${this.url.serverUrl}send_delivery_otp`, this.send_delivered)
  //       .subscribe(
  //         (res: any) => {
  //           console.log(res);
  //           this.url.dismiss();
  //         },
  //         (err) => {
  //           this.url.presentToast('Error updating order status.');
  //           this.url.dismiss();
  //         }
  //       );
  //   });
  // }

  // async verify_delivery_otp(order_id2: any, otp: number) {
  //   if (!otp) {
  //     this.url.presentToast('Please Fill OTP.');
  //     return;
  //   }
  
  //   const data = {
  //     order_id2: order_id2,
  //     otp: otp
  //   };
  
  //   this.http.post(`${this.url.serverUrl}verify_delivery_otp`, data)
  //     .subscribe(
  //       async (res: any) => {
  //         if (res.status) {
  //           this.deliveryorder.status = 'Order Delivered';
  //           await this.url.presentToast(res.message); 
  //           const modal = await document.querySelector('ion-modal');
  //           if (modal) {
  //             await modal.dismiss();
  //           }
  //         } else {
  //           await this.url.presentToast(res.message);
  //         }
  //       },
  //       async (err) => {
  //         await this.url.presentToast('Error verifying OTP.');
  //       }
  //     );
  // }
  
  // updtaedeliveryboy

  // async verify_delivery_otp(order_id2: any, otp: number) {
  //   if (!otp) {
  //     this.url.presentToast('Please Fill OTP.');
  //     return;
  //   }
  
  //   const data = {
  //     order_id2: order_id2,
  //     otp: otp
  //   };
  
  //   this.http.post(`${this.url.serverUrl}verify_delivery_otp`, data)
  //     .subscribe(
  //       async (res: any) => {
  //         console.log(res, 89);
  //         if (res.status) {
  //           console.log(res, 88);
  //           this.deliveryorder.status = 'Order Delivered';
  //           this.url.dismiss(); 
  //           await this.url.presentToast(res.message); 
  //         } else {
  //           this.url.dismiss()  
  //           this.url.presentToast('Invalid OTP');
  //         }
  //       },
  //       async (err) => {
  //         this.url.dismiss();
  //         await this.presentToast('Error verifying OTP.');
  //       }
  //     );
  // }
  
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000 // Toast duration in milliseconds
    });
    toast.present();
  }

  async getCurrentLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.currentLocation = {
      lat: coordinates.coords.latitude,
      lon: coordinates.coords.longitude
    };
    console.log('Current location:', this.currentLocation);
    this.storeLocationInDatabase();
  }

  storeLocationInDatabase() {
    this.storage.get('delivery').then((res1) => {
      this.user_id1 = parseInt(res1.delivery_id, 10);
      // alert(this.user_id1);
      const locationData = {
        id: this.user_id1,
        latitude: this.currentLocation.lat,
        longitude: this.currentLocation.lon
      };
      this.http.post(`${this.url.serverUrl}update_delivery_location`, locationData)
        .subscribe(
          (res: any) => {
            if (res.status) {
              console.log('Location stored successfully!');
            } else {
              console.error('Failed to store location');
            }
          },
          (err) => {
            console.error('Error storing location:', err);
          }
        );
    });
  }


}
