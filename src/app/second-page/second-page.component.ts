
'use strict';
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {WebcamImage} from "ngx-webcam";
import {Observable, Subject} from "rxjs";
import {ComputerVisionClient} from "@azure/cognitiveservices-computervision";
import {ApiKeyCredentials} from "@azure/ms-rest-js";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import SignaturePad from "signature_pad";

@Component({
  selector: 'app-second-page',
  templateUrl: './second-page.component.html',
  styleUrls: ['./second-page.component.css']
})
export class SecondPageComponent implements OnInit, AfterViewInit {

  key = '23b2cdd46fe44091af67bbb16b542f64';
  endpoint = 'https://tests.cognitiveservices.azure.com/vision/v3.2/analyze';

  private trigger: Subject<any> = new Subject();

  public webcamImage!: WebcamImage;
  private nextWebcam: Subject<any> = new Subject();

  captureImage  = '';

  imageBlob: any;

  errorMessages: string[] = [];

  success: boolean = false;

  @ViewChild("signature-pad")  canvas: HTMLCanvasElement | null | undefined;


  signaturePad: SignaturePad | undefined;


  constructor(public httpClient: HttpClient) {

  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    window.onresize = this.resizeCanvas;
    this.canvas = <HTMLCanvasElement>document.getElementById("signature-pad")
    if (this.canvas) {
      console.log("setting signaturepad")
      this.signaturePad = new SignaturePad(<HTMLCanvasElement>this.canvas, {
        backgroundColor: 'rgb(250,250,250)'
      });
    }
  }

  clearSignaturePad() {
    console.log(this.canvas)
    if(this.signaturePad) {
      this.signaturePad.clear();

    }
  }

  public triggerSnapshot(): void {
    this.trigger.next(null);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.captureImage = webcamImage!.imageAsDataUrl;
   // @ts-ignore
    document.getElementById('uploaded_image').src = '';

    console.info('received webcam image', this.captureImage);
  }

  public get triggerObservable(): Observable<any> {

    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<any> {

    return this.nextWebcam.asObservable();
  }

  checkPicture() {
    this.errorMessages = [];
    this.checkPhoto().then(result => {
      // @ts-ignore
      console.log(result);
      // @ts-ignore
      this.checkColors(result.color)
      // @ts-ignore
      this.checkPosition(result.faces, result.metadata);

      this.errorMessages.length > 0 ? this.success = false : this.success = true;
    });

  }

  checkPhoto() {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/octet-stream');
    headers = headers.append('Ocp-Apim-Subscription-Key', this.key);
    const url = this.endpoint + "?overload=stream&visualFeatures=Tags,Color,Faces&details=Landmarks";

    if(this.captureImage) {
      console.log("sending the webcam image")
      return this.httpClient.post(encodeURI(url),
        this.makeblob(this.webcamImage.imageAsBase64, 'image/jpeg', 0)
        , {headers: headers})
        .toPromise()
        .catch((error: any) => console.log(error));
    } else {
      return this.httpClient.post(encodeURI(url),
        this.imageBlob
        , {headers: headers})
        .toPromise()
        .catch((error: any) => console.log(error));
    }

  }

  makeblob(b64Data: string, contentType: string, sliceSize: number) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    // var byteCharacters = Buffer.from(b64Data, 'base64');
    var byteCharacters = window.atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  loadFile(event: any) {
    var image = document.getElementById('uploaded_image');

    this.imageBlob = event.target.files[0];

    // @ts-ignore
    image.src = URL.createObjectURL(event.target.files[0]);
    this.captureImage = ''
  };

  checkColors(colors: any) {
    if(colors.isBWImg) {
      this.errorMessages.push("De foto mag niet zwart wit zijn")
    }
    if(colors.dominantColorBackground !== "White") {
      this.errorMessages.push("De achtergrond moet wit zijn")
    }

  }

  checkPosition(face: any, metadata: any) {
    const width = face[0].faceRectangle.width
    const left = face[0].faceRectangle.left
    const faceCenter = left + (width/2);
    const centerPosition = metadata.width/2

    if(faceCenter < (centerPosition - 20) || faceCenter > (centerPosition + 20)) {
      this.errorMessages.push("Hoofd is niet gecentreerd")
    }
  }



  resizeCanvas() {
    if(this.canvas) {
      var ratio = Math.max(window.devicePixelRatio || 1, 1);
      this.canvas.width = this.canvas.offsetWidth * ratio;
      this.canvas.height = this.canvas.offsetHeight * ratio;
      // @ts-ignore
      this.canvas.getContext("2d").scale(ratio, ratio);
    }
  }






  // checkPhoto() {
  //
  //     async.series([
  //       async () => {
  //
  //         /**
  //          * DETECT TAGS
  //          * Detects tags for an image, which returns:
  //          *     all objects in image and confidence score.
  //          */
  //         console.log('-------------------------------------------------');
  //         console.log('DETECT TAGS');
  //         console.log();
  //
  //         // Image of different kind of dog.
  //         const tagsURL = 'https://moderatorsampleimages.blob.core.windows.net/samples/sample16.png';
  //         if(this.computerVisionClient) {
  //         // Analyze URL image
  //         console.log('Analyzing tags in image...', tagsURL.split('/').pop());
  //         const tags = (await this.computerVisionClient.analyzeImage(tagsURL, { visualFeatures: ['Tags'] })).tags;
  //         console.log(`Tags: ${formatTags(tags)}`);
  //
  //         // Format tags for display
  //         function formatTags(tags: any[] | undefined) {
  //           if(tags) {
  //             return tags.map(tag => (`${tag.name} (${tag.confidence.toFixed(2)})`)).join(', ');
  //           } else {
  //             return null;
  //           }
  //         }
  //         /**
  //          * END - Detect Tags
  //          */
  //         console.log();
  //         console.log('-------------------------------------------------');
  //         console.log('End of quickstart.');
  //         }
  //       },
  //       function () {
  //         return new Promise<void>((resolve) => {
  //           resolve();
  //         })
  //       }
  //     ], (err: any) => {
  //       throw (err);
  //     });
  //
  //
  // }
}
