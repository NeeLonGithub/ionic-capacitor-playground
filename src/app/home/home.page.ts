import { Component } from '@angular/core'

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Geolocation, Position } from '@capacitor/geolocation'
import { Share } from '@capacitor/share'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public myImage: string | null = null;
  public position: Position | null = null;

  constructor() {}

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    this.myImage = image.webPath || null;
  }

  async getCurrentPosition() {
    this.position = await Geolocation.getCurrentPosition();
  }

  async share() {
    if(!this.position) return;

    await Share.share({
      title: 'Here I am',
      text: `My location is:
        lat:  ${this.position.coords.latitude},
        long: ${this.position.coords.longitude}`,
      url: 'https://example.com'
    });
  }
}
