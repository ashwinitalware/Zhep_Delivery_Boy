
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { DataService } from '../data.service';
import { NavController } from '@ionic/angular';

declare const google: any;

@Component({
  selector: 'app-show-map',
  templateUrl: './show-map.page.html',
  styleUrls: ['./show-map.page.scss'],
})
export class ShowMapPage implements OnInit {
 
  map: any;
  @ViewChild('mapElement') mapElement: any;
  page: HTMLElement | null = document.querySelector('app-show-map');

  modalRef: HTMLIonModalElement | undefined;

  shop_location: any;
  user_address = 'Move home marker to select your address';
  btn_disabled: any;
  user_lat = 20.938894;
  user_lang = 77.7421033;
  user_marker: any;
  geolocation: any;
  user_id1: any;
  addressType: string;

  pickupAddress: any;
  deliveryAddress: any;

  api_key: any;
  distance: any;
  duration: any;

  constructor(
    public url: DataService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private storage: Storage,
    private navCtrl: NavController
  ) {
    this.geolocation = Geolocation;
    this.user_address = this.route.snapshot.queryParams['address'];
    this.addressType = this.route.snapshot.queryParams['type'];
    this.pickupAddress = this.route.snapshot.queryParams['address'];
  }

  async ngOnInit() {
    this.pickupAddress = this.route.snapshot.queryParams['address'];
    this.deliveryAddress = this.route.snapshot.queryParams['deliveryAddress'];
    await this.getApiKeyAndLoadMap();
    await this.loadGoogleMapsScript();
    this.initializeMap();
    this.showRoute();
  }

  async showRoute() {
    try {
      const currentLocation = await this.getCurrentPosition();
      const destinationLocation = await this.getGeocode(this.pickupAddress);
      this.createRoute(currentLocation, destinationLocation);
    } catch (error) {
      console.error('Error showing route:', error);
    }
  }

  async getCurrentPosition() {
    const resp = await this.geolocation.getCurrentPosition({
      maximumAge: 5000,
      timeout: 5000,
      enableHighAccuracy: true,
    });
    return { lat: resp.coords.latitude, lng: resp.coords.longitude };
  }

  async getGeocode(address: string) {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK') {
          resolve({ lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
        } else {
          reject(status);
        }
      });
    });
  }

  navigateToGoogleMaps(type: string) {
    let address = type === 'delivery' ? this.deliveryAddress : this.pickupAddress;
    if (address) {
      let googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
      window.open(googleMapsUrl, '_system');
    } else {
      console.error('Address not provided.');
    }
  }
  createRoute(origin: any, destination: any) {
    const directionsService = new google.maps.DirectionsService();
    const directionsDisplay = new google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: '#000000', // Set the route color to black
        strokeWeight: 7, // Adjust the thickness of the route line
      }
    });
    directionsDisplay.setMap(this.map);
  
    const request = {
      origin: origin,
      destination: destination,
      travelMode: 'DRIVING'
    };
  
    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        directionsDisplay.setDirections(result);
  
        const route = result.routes[0].legs[0];
        this.duration = route.duration.text;
        this.distance = route.distance.text;
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  }
  createRoute1(origin: any, destination: any) {
    const directionsService = new google.maps.DirectionsService();
    const directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(this.map);

    const request = {
      origin: origin,
      destination: destination,
      travelMode: 'DRIVING'
    };

    directionsService.route(request, (result: any, status: any) => {
      if (status == 'OK') {
        directionsDisplay.setDirections(result);

        const route = result.routes[0].legs[0];
        this.duration = route.duration.text;
        this.distance = route.distance.text;
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  }

  async getApiKeyAndLoadMap() {
    try {
      const res: any = await this.http.get(`${this.url.serverUrl}api_key`).toPromise();
      if (res.status) {
        this.api_key = res.data;
        if (!this.map) {
          await this.loadGoogleMapsScript();
        }
      } else {
        console.error('Error fetching API key:', res);
      }
    } catch (err) {
      console.error('Error fetching API key:', err);
    }
  }

  async loadGoogleMapsScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.api_key}`;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  initializeMap() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: 20.945643, lng: 77.7639723 },
      zoom: 14,
      disableDefaultUI: true,
    });
  }

  ionViewDidEnter() {
    if (typeof google === 'undefined') {
      console.error('Google Maps API script has not loaded.');
      return;
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: 20.945643, lng: 77.7639723 },
      zoom: 14,
      disableDefaultUI: true,
    });
  }

  get_user_current_position(lat: any, lang: any) {
    this.user_marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lang),
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      icon: {
        url: `assets/icon/.png`,
        scaledSize: new google.maps.Size(60, 60),
        origin: new google.maps.Point(0, 0),
      },
    });

    this.map.setZoom(18);
    const latLng2 = new google.maps.LatLng(lat, lang);
    this.map.panTo(latLng2);
    this.fetch_address(lat, lang);
    this.user_marker.addListener('dragend', (e: any) => {
      this.user_lat = e.latLng.lat();
      this.user_lang = e.latLng.lng();
      this.url.user_map_lat = e.latLng.lat();
      this.url.user_map_lan = e.latLng.lng();
      this.fetch_address(e.latLng.lat(), e.latLng.lng());
    });
  }

  fetch_address(lat: any, lng: any) {
    const reverseGeocodingUrl =
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&sensor=true&key=${this.api_key}`;
    fetch(reverseGeocodingUrl)
      .then((result) => result.json())
      .then((featureCollection) => {
        if (featureCollection.results && featureCollection.results.length > 0) {
          this.user_address = featureCollection.results[0].formatted_address;
          this.url.user_map_address = featureCollection.results[0].formatted_address;
          this.url.user_map_lat = lat;
          this.url.user_map_lan = lng;
          this.btn_disabled = false;
        } else {
          console.error('No results found for the given coordinates.');
        }
      })
      .catch((error) => {
        console.error('Error fetching address:', error);
      });
  }
  
  fetch_address1(lat: any, lng: any) {
    const reverseGeocodingUrl =
      'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
      lat +
      ',' +
      lng +
      '&sensor=true&key=${this.api_key}';
    fetch(reverseGeocodingUrl)
      .then((result) => result.json())
      .then((featureCollection) => {
        if (featureCollection.results && featureCollection.results.length > 0) {
          this.user_address = featureCollection.results[0].formatted_address;
          this.url.user_map_address = featureCollection.results[0].formatted_address;
          this.url.user_map_lat = lat;
          this.url.user_map_lan = lng;
          this.btn_disabled = false;
        } else {
          console.error('No results found for the given coordinates.');
        }
      })
      .catch((error) => {
        console.error('Error fetching address:', error);
      });
  }



}
