import { Component, OnInit } from '@angular/core';
import { getDay } from 'date-fns';
import { fr,ru,enGB } from 'date-fns/locale';

import { LocaleConfig } from '../../../../src/daterangepicker';
// moment.locale('fr', localization);
// window.__localeId__=''
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
    daysOfWeek: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    firstDay: 0,
    format: 'MM/dd/yyyy', // could be 'YYYY-MM-DDTHH:mm:ss.SSSSZ'
    displayFormat: 'MM/dd/yyyy', // default is format value
    name:ru
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
    return getDay(date) === 0;
  }
  isCustomDate(date) {
    return (
      getDay(date) === 0 || getDay(date) === 6
    ) ? 'mycustomdate' : false;
  }

}
