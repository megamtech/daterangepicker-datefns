import { Component, OnInit, ViewChild } from '@angular/core';
import { endOfDay, startOfDay } from 'date-fns';
// import * as moment from 'moment';
import { DaterangepickerComponent, DaterangepickerDirective } from '../../../../src/daterangepicker';

@Component({
  selector: 'timepicker',
  templateUrl: './timepicker.component.html'
})
export class TimepickerComponent implements OnInit {
  selected: {startDate: Date, endDate:Date};
  constructor() {
    this.selected = {
      startDate: startOfDay(new Date),
      endDate: endOfDay(new Date)
    }
   }

  ngOnInit() {
  }

}
