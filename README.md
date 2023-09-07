# Ionic & Capacitor Playground

### Wat is Ionic
Ionic is een open source mobile UI toolkit voor single codebase cross-platform mobile apps.
Het is oorspronkelijk voor Angular gebouwd maar heeft nu ook built-in support voor React en Vue.

Zie hier [de Ionic componenten library](https://ionicframework.com/docs/components).

### Wat is Capacitor
Capacitor kun je zien als een brug van Javascript naar het native platform.
Hierdoor kun je met een JavaScript applicatie bijvoorbeeld de camera of locatiebepaling van je mobiele telefoon aanspreken.

### Wat gaan we doen?
We gaan een Angular applicatie maken met Ionic componenten, zodat we die kunnen compilen voor Android en iOS, maar ook als PWA kunnen inzetten.
Met de Capacitor API gebruiken we locatiebepaling, de camera en het deelmenu om een idee te krijgen van hoe dat dan werkt.

### Handleiding
1. Installeer de Ionic CLI:

    ```bash
    npm i -g @ionic/cli
    ```

2. Start een nieuw Ionic project:  
    ```bash
    ionic start ionic-capacitor blank --type=angular --capacitor
    ```
    Hierin is `ionic-capacitor` de naam van het project.
    Het template dat we gebruiken is `blank` (in dit geval dus geen template).
    De optie `--type=angular` geeft ons het Angular framework als opzet.
    De optie `--capacitor` zorgt voor Capacitor integratie.


3. Om de app als PWA te kunnen gebruiken hebben we een manifest en een service worker nodig.
De Angular CLI kan dat voor ons doen, maar dan moet die wel geïnstalleerd zijn:  
    ```bash
    npm i -g @angular/cli
    ```
4. Gebruik de Angular CLI voor de PWA opzet:  
    ```bash
    ng add @angular/pwa
    ```
5. Nu hebben we een lege app die als PWA, Android app en iOS app kan worden gebouwd.
Met Capacitor kunnen we native APIs aanspreken (of diens web API equivalent):  
    ```bash
    npm i @capacitor/camera
    ```
6. Maar er is geen goede web UI voor het gebruik van de camera, dus halen we die van een extra package, zodat we ook in een PWA de gebruiker om een foto kunnen vragen:  
    ```bash
    npm i @ionic/pwa-elements
    ```
7. Nu kunnen we iets met de camera gaan doen in de applicatie:
   1. In `main.ts` voegen we bovenaan het bestand een import voor `defineCustomElements` toe:  
      ```typescript
      import { defineCustomElements } from '@ionic/pwa-elements/loader'
      ```
      En die gebruiken we onderaan, als laatste regel in het bestand:  
      ```javascript
      defineCustomElements(window)
      ```
      Hierdoor kunnen we de PWA Elements van stap 6 gebruiken.
   2. In `app/home/home.page.ts` voegen we `Camera`, `CameraResultType` en `CameraSource` toe aan de imports:  
      ```typescript
      import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
      ```  
      Op het component voegen we een property `myImage` toe, boven de constructor:  
      ```typescript
      public myImage: string | null = null
      ```
      En onder de constructor voegen we de methode `takePicture()` toe om die property een waarde te kunnen geven:
      ```typescript
      async takePicture() {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera
        })
        
        this.myImage = image.webPath || null
      }
      ```
   3. In `app/home/home.page.html` voegen we Ionic componenten toe: `<ion-button>` om `takePicture()` aan te roepen en `<ion-img>` om conditioneel de genomen foto te laten zien:
      ```angular2html
      <ion-header [translucent]="false">
        <ion-toolbar color="primary">
          <ion-title>
          Capacitor PWA
          </ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-content [fullscreen]="true">
        <ion-card>
          <ion-card-content>
            <ion-button (click)="takePicture()" expand="block">
              <ion-icon name="camera" slot="start"></ion-icon>
              Capture image
            </ion-button>
      
            <ion-img *ngIf="myImage" [src]="myImage"></ion-img>
          </ion-card-content>
        </ion-card>
      </ion-content>
      ```
      Je kunt dit al testen door het lokaal te draaien met de ionic CLI:
      ```bash
      ionic serve
      ```
8. Geolocation

   Dit is eigenlijk meer van hetzelfde, maar meer integratie met native elementen maakt het natuurlijk wel interessanter.
We gaan het apparaat vragen om zijn locatie en deze informatie gaan we verwerken tot een berichtje.
Vervolgens roepen we de 'share' interface aan om het berichtje te kunnen delen via email/slack/sms/etc.

   1. Om de geolocation en share API van Capacitor te kunnen gebruiken, moeten we die nog apart installeren:
      ```bash
      npm i @capacitor/geolocation
      npm i @capacitor/share
      ```
   2. In `app/home/home.page.ts` voegen we Geolocation, Position en Share toe aan de imports:
      ```typescript
      import { Geolocation, Position } from '@capacitor/geolocation'
      import { Share } from '@capacitor/share'
      ```
      Op het component voegen we een property `position` toe, net als we deden met `myImage`:
      ```typescript
      public position: Position | null = null
      ```
      En net als met de camera voegen we de methodes `getCurrentPosition()` toe om die property een waarde te kunnen geven:
      ```typescript
      async getCurrentPosition() {
        this.position = await Geolocation.getCurrentPosition();
      }
      ```
      Daarnaast voegen we een methode `share()` toe, die de locatie als bericht kan delen:
      ```typescript
      async share() {
        if(!this.position) return;
      
        await Share.share({
          title: 'Here I am',
          text: `My location is:
            lat:  ${this.position.coords.latitude},
            long: ${this.position.coords.longitude}`,
          url: 'https://www.example.com'
        });
      }
      ```
   3. In `app/home/home.page.html` voegen we een extra `<ion-card>` met `<ion-card-content>` toe, met:
      - een button om `getCurrentPosition()` aan te kunnen roepen
      - conditionele items om de coördinaten van `position` te tonen 
      - een conditionele button om daarna `share()` aan te roepen
      ```angular2html
      <ion-card>
        <ion-card-content>
          <ion-button (click)="getCurrentPosition()" expand="block">
            <ion-icon name="locate" slot="start"></ion-icon>
            Get position
          </ion-button>
          <ion-item *ngIf="position">
            <ion-icon name="location" slot="start"></ion-icon>
            Lat: {{ position.coords.latitude }}
          </ion-item>
          <ion-item *ngIf="position" [lines]="'none'">
            <ion-icon name="location" slot="start"></ion-icon>
            Lng: {{ position.coords.longitude }}
          </ion-item>

          <ion-button *ngIf="position" (click)="share()" expand="block" color="secondary">
            <ion-icon name="share" slot="start"></ion-icon>
            Share!
          </ion-button>
        </ion-card-content>
      </ion-card>
      ```
      Wederom kun je de nieuwe opzet testen door het lokaal te draaien met de ionic CLI:
      ```bash
      ionic serve
      ```


9. Met het serve commando wordt de applicatie lokaal als website gehost, maar niet als PWA om te voorkomen dat er service workers in je browser op je ontwikkel-port geïnstalleerd worden.
   Om de applicatie als PWA te hosten, moet je daarom een productie build draaien, en die hosten op je host omgeving naar keuze.
   De productie build draai je met:
   ```bash
   ionic build --prod
   ```
   Hiermee wordt (volgens de instructies in `angular.json`) naast je `src` mapje een mapje aangemaakt dat `www` heet met daarin de productie build in.
   
