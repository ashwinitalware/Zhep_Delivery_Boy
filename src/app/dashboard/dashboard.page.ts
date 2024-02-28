import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  isDataLoaded: boolean = false;
  switchTab = 'order';
  user_id1: any;
  alldeliveryorder: any;
  session_data1: any;
  processingorder: any[] = [];
  completedorder: any;

  constructor(
    public url: DataService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private storage: Storage,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.storage.create();
  }

  table_accepted = {
    order_id: '',
  };

  table_cancelled ={
    order_id: '',
  }

  table_pickup ={
    order_id: '',
  }

  table_delivered ={
    order_id: '',
  }
 
  book_order() {
  }

  processing_order() {
  }

  completed_order() {
  }

  segmentChanged(ev: any) {
    this.switchTab = ev.detail.value;
    console.log('Segment changed', ev);
  }
  ionViewWillEnter() {
    this.url.presentLoading();
    this.get_delivery_order();
    this.url.dismiss();
  }

  get_delivery_order() {
    this.http.get(`${this.url.serverUrl}get_delivery_order?`).subscribe(
      (res: any) => {
        // alert();
        if (res.status) {
          this.processingorder = res.data.filter((deliveryorder: any) =>
            deliveryorder.status === 'In Progress' ||
            deliveryorder.status === 'Order Accepted' ||
            deliveryorder.status === 'Order Cooking' ||
            deliveryorder.status === 'Ready for Pickup' ||
            deliveryorder.status === 'Ready for Delivery'
          );
  
          // Include 'completed' status in filtering logic
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
        return '#ffc409'; // Yellow
      case 'In Progress':
        return 'orange';
      case 'Order Accepted':
      case 'Order Cooking':
        return '#00771c'; // Green
      case 'Order is Pickup':
        return '#00771c'; // Adjust this to the desired color for "Order is Pickup"
      default:
        return '#ffc409'; // Default color
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
    this.url.presentLoading();
    this.http.post(`${this.url.serverUrl}delivery_accept_order`, this.table_accepted)
      .subscribe(
        (res: any) => {
          console.log(res);

          if (res.status) {
            this.url.presentToast('Your Order Table has been Accepted successfully!');
            this.moveOrderToProcessing(order_id2);
            this.switchTab = 'processing';
            
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
            // Change the function to move the order to 'completed'
            this.moveOrderTocompletedorder(order_id2);
            this.switchTab = 'completed';

            // No need to reload order data after accepting the order
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

delivered_table(order_id2: any){
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


// accept_table(order_id2: any) {
//   this.storage.get('delivery').then((res1) => {
//     this.user_id1 = parseInt(res1.delivery_id, 10);
//     this.table_accepted['order_id'] = order_id2;
//     this.url.presentLoading();
//     this.http.post(`${this.url.serverUrl}delivery_accept_order`, this.table_accepted)
//       .subscribe(
//         (res: any) => {
//           console.log(res);

//           if (res.status) {
//             this.url.presentToast('Your Order Table has been Accepted successfully!');
//             this.moveOrderToProcessing(order_id2);
//             this.switchTab = 'processing';
//             this.url.dismiss();
//           } else {
//             this.url.presentToast('Failed to update the order status.');
//             this.url.dismiss();
//           }
//         },
//         (err) => {
//           this.url.presentToast('Error updating order status.');
//           this.url.dismiss();
//         }
//       );
//   });
// }

  

  
  show_map() {
    this.router.navigate([`show-map`]);
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
            this.removeOrderFromList(order_id2); // Remove the order from the list
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
      this.alldeliveryorder.splice(index, 1); // Remove the order from the array
    }
  }


}
