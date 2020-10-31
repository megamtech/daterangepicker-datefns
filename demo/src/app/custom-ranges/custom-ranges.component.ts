import { Component, OnInit } from '@angular/core';
// import * as moment from 'moment';
import { add, sub, endOfDay, startOfDay, startOfMonth } from 'date-fns';
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
  maxDate: moment.Moment;
  minDate: moment.Moment;
  invalidDates: moment.Moment[] = [];
  tooltips = [
    { date: new Date(), text: 'Today is just unselectable' },
    { date: add(new Date(), { 'days': 2 }), text: 'Yeeeees!!!' }
  ];
  inlineDateTime;
  ranges: any = {
    Today: [startOfDay(new Date()), endOfDay(new Date())],
    Yesterday: [startOfDay(sub(new Date, { 'days': 1 })), endOfDay(sub(new Date, { 'days': 1 }))],
    'Last 7 Days': [startOfDay(sub(new Date, { 'days': 7 })), endOfDay(new Date)],
    'Last 30 Days': [startOfDay(sub(new Date, { 'days': 30 })), endOfDay(new Date)],
    'This Month': [startOfMonth(new Date), endOfMonth(new Date)],
    'Last Month': [
      startOfMonth(sub(new Date, { months: 1 })), endOfMonth(sub(new Date, { months: 1 }))
    ],
    'Last 3 Month': [
      startOfMonth(sub(new Date, { months: 3 })), endOfMonth(sub(new Date, { months: 1 }))
    ]
  };

  getRange(startDate, intervalStart = 1, intervalEnd = 1, intervalType: any = { 'days': 1 }, addOrSub = '') {
    let result = [];
    const addOrSubFunc = addOrSub === '' ? add : sub;
    // let interval = days;
    // intervalType
    result.push(startOfDay(addOrSubFunc(startDate, { days: intervalStart })));
    result.push(endOfDay(addOrSubFunc(startDate, { days: intervalEnd })));
    return result;
  }
  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some(d => d.isSame(m, 'day'));
  }
  isTooltipDate = (m: moment.Moment) => {
    const tooltip = this.tooltips.find(tt => tt.date.isSame(m, 'day'));
    if (tooltip) {
      return tooltip.text;
    } else {
      return false;
    }
  }

  constructor() {
    this.maxDate = moment().add(2, 'weeks');
    this.minDate = moment().subtract(3, 'days');

    this.alwaysShowCalendars = true;
    this.keepCalendarOpeningWithRange = true;
    this.showRangeLabelOnInput = true;
    this.selected = {
      startDate: moment().subtract(1, 'days').set({ hours: 0, minutes: 0 }),
      endDate: moment().subtract(1, 'days').set({ hours: 23, minutes: 59 })
    };
  }
  rangeClicked(range) {
    console.log('[rangeClicked] range is : ', range);
  }
  datesUpdated(range) {
    console.log('[datesUpdated] range is : ', range);
  }

  ngOnInit() { }
  choosedDateTime(e) {
    this.inlineDateTime = e;
  }
}
