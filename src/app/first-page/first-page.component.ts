import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-first-page',
  templateUrl: './first-page.component.html',
  styleUrls: ['./first-page.component.css']
})
export class FirstPageComponent implements OnInit {


  @Output() setPage: EventEmitter<{page: number}> = new EventEmitter<{page: number}>();

  constructor() { }

  ngOnInit(): void {
  }

  goToSecondPage() {
    this.setPage.emit({page: 2})
  }

}
