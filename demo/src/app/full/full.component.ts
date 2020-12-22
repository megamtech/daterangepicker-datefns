import { Component, OnInit, ViewChild } from '@angular/core';
import { add, sub } from 'date-fns';
// import * as moment from 'moment';
import { DaterangepickerDirective } from '../../../../src/daterangepicker/daterangepicker.directive';

@Component({
  selector: 'full',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})
export class FullComponent implements OnInit {

  title = 'Pure angular daterangepicker';
  options: any = {
    autoApply: false,
    alwaysShowCalendars: false,
    showCancel: false,
    showClearButton: false,
    linkedCalendars: true,
    singleDatePicker: false,
    showWeekNumbers: false,
    showISOWeekNumbers: false,
    customRangeDirection: false,
    lockStartDate: false,
    closeOnAutoApply: true
  };
  minDate: any = sub(new Date(), { 'days': 5 });
  maxDate: any = add(new Date(), { 'months': 2 });
  locale: any = {
    format: 'yyyy-MM-dd HH:mm:ss XXX',
    displayFormat: 'dd MMMM yyyy HH:mm',
    separator: ' To ',
    cancelLabel: 'Cancel',
    applyLabel: 'Okay'
  }
  opens: string;
  drops: string;
  timePicker: boolean;
  dateLimit: number;
  click() {
  }
  selected: any;
  @ViewChild(DaterangepickerDirective, { static: true }) daterangepicker: DaterangepickerDirective;
  constructor() {
    this.timePicker = false;
    this.opens = 'right';
    this.drops = 'down';
    this.dateLimit = 30;
  }

  clear(): void {
    this.daterangepicker.clear();
  }
  ngOnInit() {
  }

  eventClicked(e): void {
    console.log({ 'eventClicked()': e });
  }
}
