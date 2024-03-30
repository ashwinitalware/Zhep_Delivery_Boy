import { Component, OnInit, ViewChild } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from "@angular/common/http";
import { Platform } from '@ionic/angular';
import { DataService } from '../data.service';
import { ActivatedRoute } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-map-page',
  templateUrl: './map-page.page.html',
  styleUrls: ['./map-page.page.scss'],
})
export class MapPagePage implements OnInit {

  @ViewChild('mapElement') mapElement: any;
  map: any;
  user_address: string = "Choose delivery location";
  loader_visible: boolean = true;
  api_key: string = ''; // Initialize with your API key
  pickupAddress: any;
  deliveryAddress: any;

  constructor(
    public url: DataService,
    public http: HttpClient,
    public platform: Platform,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.platform.ready().then(() => {
      this.route.queryParams.subscribe(params => {
        if (params && params['address']) {
          if (params['address'].startsWith('Pickup')) {
            this.pickupAddress = params['address'].substr(7);
          } else {
            this.deliveryAddress = params['address'].substr(9);
          }
        }
      });
      this.fetchApiKeyAndLoadMap();
       // this.updateDeliveryLo0cationContinuously();
    });
  }

  printCurrentPosition = () => {
    Geolocation.getCurrentPosition({
      maximumAge: 5000,
      timeout: 5000,
      enableHighAccuracy: true
    }).then((resp) => {
      this.get_user_current_position(resp.coords.latitude, resp.coords.longitude);
    }).catch((error) => {
      console.error('Error getting current position:', error);
    });
  };


  get_user_current_position(lat: any, lang: any) {
    // Send the current location to the server to update the database
    this.updateDeliveryLocation(lat, lang);
  
    // Update the center of the map to the obtained coordinates
    this.map.setCenter({ lat: lat, lng: lang });
  
    // Optionally, you can add a marker to indicate the current location
    // Uncomment the following lines to add a marker
    // var marker = new google.maps.Marker({
    //   position: { lat: lat, lng: lang },
    //   map: this.map,
    //   title: 'Current Location'
    // });
  }
  

  fetchApiKeyAndLoadMap() {
    // Fetch API key from your server
    this.http.get(`${this.url.serverUrl}api_key`).subscribe(
      (res: any) => {
        if (res.status) {
          this.api_key = res.data;
          this.loadGoogleMapsScript();
        } else {
          console.error('Error fetching API key:', res);
        }
      },
      (err) => {
        console.error('Error fetching API key:', err);
      }
    );
  }

  loadGoogleMapsScript() {
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.api_key;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.initializeMap();
    };

    document.body.appendChild(script);
  }

  initializeMap() {
    // Initialize the map
    this.map = new google.maps.Map(
      this.mapElement.nativeElement,
      {
        center: { lat: 0, lng: 0 }, // Initialize with a default center
        zoom: 14,
        disableDefaultUI: true,
      }
    );
  
    // Fetch current position and then draw route if available
    this.printCurrentPosition();
  
    if (this.pickupAddress) {
      // Draw route from current location to pickup address
      this.drawRoute(this.pickupAddress);
    } else if (this.deliveryAddress) {
      // Draw route from current location to delivery address
      this.drawRoute(this.deliveryAddress);
    }
  }

  // initializeMap() {
  //   // Initialize the map
  //   this.map = new google.maps.Map(
  //     this.mapElement.nativeElement,
  //     {
  //       center: { lat: 20.945643, lng: 77.7639723 },
  //       zoom: 14,
  //       disableDefaultUI: true,
  //     }
  //   );
  
  //   // Fetch current position and then draw route if available
  //   this.printCurrentPosition();
  
  //   if (this.pickupAddress) {
  //     // Draw route from current location to pickup address
  //     this.drawRoute(this.pickupAddress);
  //   } else if (this.deliveryAddress) {
  //     // Draw route from current location to delivery address
  //     this.drawRoute(this.deliveryAddress);
  //   }
  // }
  

  updateDeliveryLocation(lat: number, lng: number) {
    this.http.post(`${this.url.serverUrl}update_delivery_location1`, {
      lat: lat,
      lng: lng
    }).subscribe(
      (res: any) => {
        console.log('Delivery location updated:', res);
      },
      (err) => {
        console.error('Error updating delivery location:', err);
      }
    );
  }

  drawRoute(destination: string) {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(this.map);

    const request = {
      origin: { lat: 20.945643, lng: 77.7639723 }, 
      destination: destination,
      travelMode: 'DRIVING'
    };

    directionsService.route(request, (result:any, status:any) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
      } else {
        console.error('Error drawing route:', status);
      }
    });
  }

  // updateDeliveryLocationContinuously() {
  //   // Continuously update the delivery boy's location
  //   setInterval(() => {
  //     this.printCurrentPosition();
  //   }, 5000); // Update every 5 seconds
  // }

  navigateToGoogleMaps(type: string) {
    let address = type === 'pickup' ? this.pickupAddress : this.deliveryAddress;
    if (address) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_system');
    } else {
      console.error('Address not provided.');
    }
  }
}
