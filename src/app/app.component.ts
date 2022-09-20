import { Component } from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'InThePicture';
  rijbewijsForm: FormGroup;
  page : number = 1;

  constructor(    public fb: FormBuilder) {
    this.rijbewijsForm = this.fb.group({
    });

  }

  setPage(pageNumber: number) {
    this.page = pageNumber;
  }


}
