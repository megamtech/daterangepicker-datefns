import { Component, OnInit } from '@angular/core';
// import * as moment from 'moment';
import { add, sub, endOfDay, startOfDay, startOfMonth, isSameDay } from 'date-fns';
import { endOfMonth } from 'date-fns/fp';

@Component({
  selector: 'custom-ranges',
  templateUrl: './custom-ranges.component.html',
  styleUrls: ['./custom-ranges.component.scss']
})
export class CustomRangesComponent implements OnInit {
  selected: any;
  alwaysShowCalendars: boolean;
  showRangeLabelOnInput: boolean;
  keepCalendarOpeningWithRange: boolean;
  maxDate: Date;
  minDate: Date;
  invalidDates: Date[] = [];
  tooltips = [
    { date: new Date(), text: 'Today is just unselectable' },
    { date: add(new Date(), { 'days': 2 }), text: 'Yeeeees!!!' }
  ];
  inlineDateTime;
  currentDate: Date = new Date()
  ranges: any = [
    { label: 'Today', start: startOfDay(new Date()), end: endOfDay(new Date()) },
    { label: 'Yesterday', start: startOfDay(sub(new Date, { 'days': 1 })), end: endOfDay(sub(new Date, { 'days': 1 })) },
    { label: 'Last 7 Days', start: startOfDay(sub(new Date, { 'days': 7 })), end: endOfDay(new Date()) },
    { label: 'Last 30 Days', start: startOfDay(sub(new Date, { 'days': 30 })), end: endOfDay(new Date()) },
    { label: 'This Month', start: startOfMonth(new Date), end: endOfDay(new Date()) },
    { label: 'Last Month', start: startOfMonth(sub(new Date, { months: 1 })), end: endOfMonth(sub(new Date, { months: 1 })) },
    { label: 'Last 3 Month', start: startOfMonth(sub(new Date, { months: 3 })), end: endOfMonth(sub(new Date, { months: 1 })) },

  ];

  getRange(startDate, intervalStart = 1, intervalEnd = 1, intervalType: any = { 'days': 1 }, addOrSub = '') {
    let result = [];
    const addOrSubFunc = addOrSub === '' ? add : sub;
    // let interval = days;
    // intervalType
    result.push(startOfDay(addOrSubFunc(startDate, { days: intervalStart })));
    result.push(endOfDay(addOrSubFunc(startDate, { days: intervalEnd })));
    return result;
  }
  isInvalidDate = (m) => {
    return this.invalidDates.some(d => isSameDay(d, m));

  }
  isTooltipDate = (m) => {
    const tooltip = this.tooltips.find(tt => isSameDay(tt.date, m));
    if (tooltip) {
      return tooltip.text;
    } else {
      return false;
    }
  }

  constructor() {
    this.maxDate = add(new Date, { 'weeks': 2 });
    this.minDate = sub(new Date, { 'days': 3 });

    this.alwaysShowCalendars = true;
    this.keepCalendarOpeningWithRange = true;
    this.showRangeLabelOnInput = true;
    this.selected = {
      startDate: startOfDay(new Date),
      endDate: endOfDay(new Date)
    };
  }
  rangeClicked(range) {
    console.log('[rangeClicked] range is : ', range);
  }
  datesUpdated(range) {
    console.log('[datesUpdated] range is : ', range);
  }

  ngOnInit() {
    // this.ranges.Today[0] = startOfDay(new Date());
    // this.ranges.Today[1] = endOfDay(new Date());
    console.log('\\\\\\\\\\\\\\', this.ranges);

  }
  choosedDateTime(e) {
    this.inlineDateTime = e;
  }
}
