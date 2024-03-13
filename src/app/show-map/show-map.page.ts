
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';

declare const google: any;

@Component({
  selector: 'app-show-map',
  templateUrl: './show-map.page.html',
  styleUrls: ['./show-map.page.scss'],
})
export class ShowMapPage implements OnInit {
  pickupAddress: any;
  directionsService: any;
  directionsRenderer: any;
  map: any;

  constructor(private route: ActivatedRoute) {
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: '#387ADF', // Dark blue color
        strokeOpacity: 1.0, // Opacity of the line
        strokeWeight: 8 // Thickness of the line
      }
    });
  }

  // ngOnInit(): void {
  //   this.route.queryParams.subscribe(params => {
  //     this.pickupAddress = params['pickupAddress'];
  //     if (this.pickupAddress) {
  //       this.displayMap(this.pickupAddress);
  //     }
  //   });
  // }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.pickupAddress = params['pickupAddress'];
      if (this.pickupAddress) {
        // Call the function to display the map with the provided pickup address
        this.displayMap(this.pickupAddress);
      }
    });
  }

  displayMap(pickupAddress: string) {
    // Initialize map
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 20.945643, lng: 77.7639723 },
      zoom: 14,
      disableDefaultUI: true,
    });

    // Add directions renderer to the map
    this.directionsRenderer.setMap(this.map);

    // Get current position
    Geolocation.getCurrentPosition().then((position) => {
      const currentLocation = { lat: position.coords.latitude, lng: position.coords.longitude };

      // Calculate route from current location to pickup address
      const request = {
        origin: currentLocation,
        destination: pickupAddress,
        travelMode: 'DRIVING'
      };

      // Custom marker icons
      const currentLocationIcon = 'assets/icon/deli_bike.png';
      const pickupLocationIcon = 'assets/icon/cafe.png';

      // Create custom markers
      const currentLocationMarker = new google.maps.Marker({
        position: currentLocation,
        map: this.map,
        icon: {
          url: currentLocationIcon,
          scaledSize: new google.maps.Size(50, 50)
        },
        animation: google.maps.Animation.DROP // Add animation to the marker
      });

      // Geocode the pickup address to obtain its coordinates
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: pickupAddress }, (results: { geometry: { location: any; }; }[], status: string) => {
        if (status === 'OK') {
          const pickupLocation = results[0].geometry.location;
          const pickupLocationMarker = new google.maps.Marker({
            position: pickupLocation,
            map: this.map,
            icon: {
              url: pickupLocationIcon,
              scaledSize: new google.maps.Size(50, 50)
            },
            animation: google.maps.Animation.DROP // Add animation to the marker
          });

          // Route calculation
          this.directionsService.route(request, (response: any, status: any) => {
            if (status == 'OK') {
              this.directionsRenderer.setDirections(response);
            } else {
              window.alert('Directions request failed due to ' + status);
            }
          });
        } else {
          console.error('Geocode failed for the following reason: ' + status);
        }
      });
    }).catch((error) => {
      console.error('Error getting current position:', error);
    });
  }

  redirectToGoogleMaps(pickupAddress: string) {
    Geolocation.getCurrentPosition().then((position) => {
      const currentLocation = `${position.coords.latitude},${position.coords.longitude}`;
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation}&destination=${encodeURIComponent(pickupAddress)}`;
      window.open(url, '_blank');
    }).catch((error) => {
      console.error('Error getting current position:', error);
      // Handle error here, such as showing a message to the user
    });
  }
}
