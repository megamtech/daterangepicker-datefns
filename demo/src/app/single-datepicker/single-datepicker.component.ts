import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/fr';
import { LocaleConfig } from '../../../../src/daterangepicker';
// moment.locale('fr', localization);

@Component({
  selector: 'single-datepicker',
  templateUrl: './single-datepicker.component.html',
  styleUrls: ['./single-datepicker.component.scss']
})
export class SingleDatepickerComponent implements OnInit {
  selected = new Date();
  locale: LocaleConfig = {
    applyLabel: 'Appliquer',
    customRangeLabel: ' - ',
    daysOfWeek:["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    firstDay: 0,
    format: 'MM/DD/YYYY', // could be 'YYYY-MM-DDTHH:mm:ss.SSSSZ'
    displayFormat: 'MM/DD/YYYY', // default is format value
  }

  // format: 'MM/DD/YYYY', // could be 'YYYY-MM-DDTHH:mm:ss.SSSSZ'
  // displayFormat: 'MM/DD/YYYY', // default is format value
  // direction: 'ltr', // could be rtl
  // weekLabel: 'W',
  // separator: ' To ', // default is ' - '
  // cancelLabel: 'Cancel', // detault is 'Cancel'
  // applyLabel: 'Okay', // detault is 'Apply'
  // clearLabel: 'Clear', // detault is 'Clear'
  // customRangeLabel: 'Custom range',
  // daysOfWeek: moment.weekdaysMin(),
  // monthNames: moment.monthsShort(),
  // firstDay: 1 // first day is monday
  constructor() { }
  ngOnInit() {
  }
  isInvalidDate(date) {
    return date.weekday() === 0;
  }
  isCustomDate(date) {
    return  (
      date.weekday() === 0 || date.weekday() === 6
    )  ? 'mycustomdate' : false;
  }

}
