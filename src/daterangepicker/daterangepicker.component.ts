import { ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    setHours, getHours,
    setMinutes, getMinutes,
    setSeconds, getSeconds,
    getDate, setDate,
    startOfDay, endOfDay, startOfToday, endOfToday, getDay,
    parseISO, parse, format,
    getDaysInMonth, lastDayOfMonth, getMonth, setMonth,
    startOfWeek, isWeekend, getWeek, getISOWeek,
    getYear, setYear,
    sub, add, isBefore, isAfter, isSameMonth, isSameSecond, isSameDay, set
} from 'date-fns';
import { LocaleConfig } from './daterangepicker.config';
import { LocaleService } from './locale.service';

// const moment = _moment;

export enum SideEnum {
    left = 'left',
    right = 'right'
}

@Component({
    selector: 'ngx-daterangepicker-material',
    styleUrls: ['./daterangepicker.component.scss'],
    templateUrl: './daterangepicker.component.html',
    host: {
        '(click)': 'handleInternalClick($event)',
    },
    encapsulation: ViewEncapsulation.None,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DaterangepickerComponent),
        multi: true
    }]
})
export class DaterangepickerComponent implements OnInit {
    private _old: { start: any, end: any } = { start: null, end: null };
    chosenLabel: string;
    calendarVariables: { left: any, right: any } = { left: {}, right: {} };
    tooltiptext = [];  // for storing tooltiptext
    timepickerVariables: { left: any, right: any } = { left: {}, right: {} };
    daterangepicker: { start: FormControl, end: FormControl } = { start: new FormControl(), end: new FormControl() };
    applyBtn: { disabled: boolean } = { disabled: false };
    @Input()
    startDate = startOfToday();
    @Input()
    endDate = endOfToday();

    @Input()
    dateLimit: number = null;
    // used in template for compile time support of enum values.
    sideEnum = SideEnum;

    @Input()
    minDate: any = null;
    @Input()
    maxDate: any = null;
    @Input()
    autoApply: Boolean = false;
    @Input()
    singleDatePicker: Boolean = false;
    @Input()
    showDropdowns: Boolean = false;
    @Input()
    showWeekNumbers: Boolean = false;
    @Input()
    showISOWeekNumbers: Boolean = false;
    @Input()
    linkedCalendars: Boolean = false;
    @Input()
    autoUpdateInput: Boolean = true;
    @Input()
    alwaysShowCalendars: Boolean = false;
    @Input()
    maxSpan: Boolean = false;
    @Input()
    lockStartDate: Boolean = false;
    // timepicker variables
    @Input()
    timePicker: Boolean = false;
    @Input()
    timePicker24Hour: Boolean = false;
    @Input()
    timePickerIncrement = 1;
    @Input()
    timePickerSeconds: Boolean = false;
    // end of timepicker variables
    @Input()
    showClearButton: Boolean = false;
    @Input()
    firstMonthDayClass: string = null;
    @Input()
    lastMonthDayClass: string = null;
    @Input()
    emptyWeekRowClass: string = null;
    @Input()
    emptyWeekColumnClass: string = null;
    @Input()
    firstDayOfNextMonthClass: string = null;
    @Input()
    lastDayOfPreviousMonthClass: string = null;

    _locale: LocaleConfig = {};
    @Input() set locale(value) {
        this._locale = { ...this._localeService.config, ...value };
    }
    get locale(): any {
        return this._locale;
    }
    // custom ranges
    _ranges: any = {};

    @Input() set ranges(value) {
        this._ranges = value;
        this.renderRanges();
    }
    get ranges(): any {
        return this._ranges;
    }

    @Input()
    showCustomRangeLabel: boolean;
    @Input()
    showCancel = false;
    @Input()
    keepCalendarOpeningWithRange = false;
    @Input()
    showRangeLabelOnInput = false;
    @Input()
    customRangeDirection = false;
    chosenRange: string;
    rangesArray: Array<any> = [];

    // some state information
    isShown: Boolean = false;
    inline = true;
    leftCalendar: any = {};
    rightCalendar: any = {};
    showCalInRanges: Boolean = false;
    nowHoveredDate = null;
    pickingDate = false;
    options: any = {}; // should get some opt from user
    @Input() drops: string;
    @Input() opens: string;
    @Input() closeOnAutoApply = true;
    @Output() choosedDate: EventEmitter<Object>;
    @Output() rangeClicked: EventEmitter<Object>;
    @Output() datesUpdated: EventEmitter<Object>;
    @Output() startDateChanged: EventEmitter<Object>;
    @Output() endDateChanged: EventEmitter<Object>;
    @ViewChild('pickerContainer', { static: true }) pickerContainer: ElementRef;

    constructor(
        private el: ElementRef,
        private _ref: ChangeDetectorRef,
        private _localeService: LocaleService
    ) {
        this.choosedDate = new EventEmitter();
        this.rangeClicked = new EventEmitter();
        this.datesUpdated = new EventEmitter();
        this.startDateChanged = new EventEmitter();
        this.endDateChanged = new EventEmitter();
    }

    ngOnInit() {
        this._buildLocale();
        const daysOfWeek = [...this.locale.daysOfWeek];
        this.locale.firstDay = this.locale.firstDay % 7;
        // if (this.locale.firstDay !== 0) {
        //     let iterator = this.locale.firstDay;

        //     while (iterator > 0) {
        //         daysOfWeek.push(daysOfWeek.shift());
        //         iterator--;
        //     }
        // }

        this.locale.daysOfWeek = daysOfWeek;
        if (this.inline) {
            this._old.start = this.startDate;
            this._old.end = this.endDate;
        }

        if (this.startDate && this.timePicker) {
            this.setStartDate(this.startDate);
            this.renderTimePicker(SideEnum.left);
        }

        if (this.endDate && this.timePicker) {
            this.setEndDate(this.endDate);
            this.renderTimePicker(SideEnum.right);
        }

        this.updateMonthsInView();

        this.renderCalendar(SideEnum.left);
        this.renderCalendar(SideEnum.right);
        this.renderRanges();
    }
    renderRanges() {
        this.rangesArray = [];
        let start: number | Date, end: number | Date;
        console.log('this.ranges==>', this.ranges);
        if (Array.isArray(this.ranges) && this.ranges.length > 0) {

            this.ranges.forEach((dateRange) => {
                if (typeof dateRange.start === 'string') {
                    start = dateRange.start;
                }
                if (typeof dateRange.end === 'string') {
                    end = dateRange.end;
                }
                if (this.minDate && isBefore(start, this.minDate)) {
                    start = this.minDate;
                }
                // if (this.maxSpan && maxDate && add(start, this.maxSpan).isAfter(maxDate)) {
                //     maxDate = add(start.clone().add(this.maxSpan);
                // }

            });

            this.ranges.forEach((element) => {
                // if (this.ranges[range]) {
                this.rangesArray.push(element);
                // }
            })
            // (const range in this.ranges) {
            //         console.log("this.ranges[range]", range, this.ranges['Last 3 Month']);
            //         if (this.ranges[range]) {
            //             if (typeof this.ranges[range][0] === 'string') {
            //                 start = format(parseISO(this.ranges[range][0]), this.locale.format);
            //             } else {
            //                 start = parseISO(this.ranges[range][0]);
            //             }
            //             if (typeof this.ranges[range][1] === 'string') {
            //                 end = format(parseISO(this.ranges[range][1]), this.locale.format);
            //             } else {
            //                 end = parseISO(this.ranges[range][1]);
            //             }
            //             // If the start or end date exceed those allowed by the minDate or maxSpan
            //             // options, shorten the range to the allowable period.
            //             if (this.minDate && start.isBefore(this.minDate)) {
            //                 start = this.minDate;
            //             }
            //             const maxDate = this.maxDate;
            //             // TODO CHECK maxSpan not used
            //             // if (this.maxSpan && maxDate && add(start,this.maxSpan).isAfter(maxDate)) {
            //             //     maxDate = add(start.clone().add(this.maxSpan);
            //             // }
            //             if (maxDate && isAfter(end, maxDate)) {
            //                 end = maxDate;
            //             }
            //             // If the end of the range is before the minimum or the start of the range is
            //             // after the maximum, don't display this range option at all.
            //             if (this.minDate && isBefore(end, this.minDate)) { this.timePicker ? 'minute' : 'day'; }
            //             if (maxDate && isAfter(start, maxDate)) { this.timePicker ? 'minute' : 'day'; }
            //             // Support unicode chars in the range names.
            //             const elem = document.createElement('textarea');
            //             elem.innerHTML = range;
            //             const rangeHtml = elem.value;
            //             this.ranges[rangeHtml] = [start, end];
            //         }
            //     }
            //     for (const range in this.ranges) {
            //         if (this.ranges[range]) {
            //             this.rangesArray.push(range);
            //         }
            //     }
            if (this.showCustomRangeLabel) {
                this.rangesArray.push({ label: this.locale.customRangeLabel, start: startOfDay(sub(new Date, { days: 1 })), end: endOfDay(new Date) });
            }
            this.showCalInRanges = (!this.rangesArray.length) || this.alwaysShowCalendars;
            if (!this.timePicker) {

                this.startDate = startOfToday();
                this.endDate = endOfToday();

            }
        }

    }
    renderTimePicker(side: SideEnum) {
        let selected, minDate;
        const maxDate = this.maxDate;
        if (side === SideEnum.left) {
            selected = this.startDate,
                minDate = this.minDate;
        } else if (side === SideEnum.right && this.endDate) {
            selected = this.endDate,
                minDate = this.startDate;
        } else if (side === SideEnum.right && !this.endDate) {
            // don't have an end date, use the start date then put the selected time for the right side as the time
            selected = this._getDateWithTime(this.startDate, SideEnum.right);
            if (isBefore(selected,this.startDate)) {
                selected = this.startDate;  // set it back to the start date the time was backwards
            }
            minDate = this.startDate;
        }
        const start = this.timePicker24Hour ? 0 : 1;
        const end = this.timePicker24Hour ? 23 : 12;
        this.timepickerVariables[side] = {
            hours: [],
            minutes: [],
            minutesLabel: [],
            seconds: [],
            secondsLabel: [],
            disabledHours: [],
            disabledMinutes: [],
            disabledSeconds: [],
            selectedHour: 0,
            selectedMinute: 0,
            selectedSecond: 0,
        };
        // generate hours
        for (let i = start; i <= end; i++) {
            let i_in_24 = i;
            if (!this.timePicker24Hour) {
                i_in_24 = getHours(selected) >= 12 ? (i === 12 ? 12 : i + 12) : (i === 12 ? 0 : i);
            }

            const time = setHours(selected, i_in_24);
            let disabled = false;
            if (minDate && isBefore(time, minDate)) {
                disabled = true;
            }
            if (maxDate && isAfter(time, maxDate)) {
                disabled = true;
            }

            this.timepickerVariables[side].hours.push(i);
            if (i_in_24 === getHours(selected) && !disabled) {
                this.timepickerVariables[side].selectedHour = i;
            } else if (disabled) {
                this.timepickerVariables[side].disabledHours.push(i);
            }
        }

        // generate minutes
        for (let i = 0; i < 60; i += this.timePickerIncrement) {
            const padded = i < 10 ? '0' + i : i;
            const time = setMinutes(selected, i);

            let disabled = false;
            if (minDate && isBefore(time, minDate)) {
                disabled = true;
            }
            if (maxDate && isAfter(time, maxDate)) {
                disabled = true;
            }
            this.timepickerVariables[side].minutes.push(i);
            this.timepickerVariables[side].minutesLabel.push(padded);
            if (getMinutes(selected) === i && !disabled) {
                this.timepickerVariables[side].selectedMinute = i;
            } else if (disabled) {
                this.timepickerVariables[side].disabledMinutes.push(i);
            }
        }
        // generate seconds
        if (this.timePickerSeconds) {
            for (let i = 0; i < 60; i++) {
                const padded = i < 10 ? '0' + i : i;
                const time = setSeconds(selected, i);

                let disabled = false;
                if (minDate && isBefore(time, minDate)) {
                    disabled = true;
                }
                if (maxDate && isAfter(time, maxDate)) {
                    disabled = true;
                }

                this.timepickerVariables[side].seconds.push(i);
                this.timepickerVariables[side].secondsLabel.push(padded);
                if (getSeconds(selected) === i && !disabled) {
                    this.timepickerVariables[side].selectedSecond = i;
                } else if (disabled) {
                    this.timepickerVariables[side].disabledSeconds.push(i);
                }
            }
        }
        // generate AM/PM
        if (!this.timePicker24Hour) {

            const am_html = '';
            const pm_html = '';
            let checkMinDate: Date, checkMaxDate: Date;
            checkMinDate = set(selected, { hours: 12, minutes: 0, seconds: 0 });
            checkMaxDate = set(selected, { hours: 0, minutes: 0, seconds: 0 });
            if (minDate && isBefore(checkMinDate, minDate)) {
                this.timepickerVariables[side].amDisabled = true;
            }

            if (maxDate && isAfter(checkMaxDate, maxDate)) {
                this.timepickerVariables[side].pmDisabled = true;
            }
            if (selected.hour() >= 12) {
                this.timepickerVariables[side].ampmModel = 'PM';
            } else {
                this.timepickerVariables[side].ampmModel = 'AM';
            }
        }
        this.timepickerVariables[side].selected = selected;
    }
    renderCalendar(side: SideEnum) { // side enum
        const mainCalendar: any = (side === SideEnum.left) ? this.leftCalendar : this.rightCalendar;
        const month = getMonth(mainCalendar.month);
        const year = getYear(mainCalendar.month);
        const hour = getHours(mainCalendar.month);
        const minute = getMinutes(mainCalendar.month);
        const second = getSeconds(mainCalendar.month);
        // CROSS checking
        const daysInMonth = getDaysInMonth(new Date(year, month));
        // CROSS checking
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month, daysInMonth);
        const lastMonth = getMonth(sub(firstDay, { 'months': 1 }));
        const lastYear = getYear(sub(firstDay, { 'months': 1 }));
        // moment([lastYear, lastMonth]).daysInMonth()
        const daysInLastMonth = getDaysInMonth(new Date(lastMonth, lastMonth));
        const
            dayOfWeek = getDay(firstDay);
        // initialize a 6 rows x 7 columns array for the calendar
        const calendar: any = [];
        calendar.firstDay = firstDay;
        calendar.lastDay = lastDay;

        for (let i = 0; i < 6; i++) {
            calendar[i] = [];
        }

        // populate the calendar with date objects
        let startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
        if (startDay > daysInLastMonth) {
            startDay -= 7;
        }

        if (dayOfWeek === this.locale.firstDay) {
            startDay = daysInLastMonth - 6;
        }
        let curDate = new Date(lastYear, lastMonth, startDay, 12, minute, second);

        for (let i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = add(curDate, { 'hours': 24 })) {
            if (i > 0 && col % 7 === 0) {
                col = 0;
                row++;
            }

            calendar[row][col] = setSeconds(setMinutes(setHours(curDate, hour), minute), second);
            curDate = setHours(curDate, 12);
            // curDate.hour();

            if (this.minDate && format(calendar[row][col], 'yyyy-MM-dd') === format(this.minDate, 'yyyy-MM-dd') &&
                isBefore(calendar[row][col], this.minDate) && side === 'left') {
                calendar[row][col] = this.minDate;
            }

            if (this.maxDate && format(calendar[row][col], 'yyyy-MM-dd') === format(this.maxDate, 'yyyy-MM-dd') &&
                isAfter(calendar[row][col], this.maxDate) && side === 'right') {
                calendar[row][col] = this.maxDate;
            }
        }

        // make the calendar object available to hoverDate/clickDate
        if (side === SideEnum.left) {
            this.leftCalendar.calendar = calendar;
        } else {
            this.rightCalendar.calendar = calendar;
        }
        //
        // Display the calendar
        //
        const minDate = side === 'left' ? this.minDate : this.startDate;
        let maxDate = this.maxDate;
        // adjust maxDate to reflect the dateLimit setting in order to
        // grey out end dates beyond the dateLimit
        if (this.endDate === null && this.dateLimit) {
            const maxLimit = endOfDay(add(this.startDate, {
                'days': this.dateLimit,

            }));
            if (!maxDate || isBefore(maxLimit, maxDate)) {
                maxDate = maxLimit;
            }
        }
        this.calendarVariables[side] = {
            month: month,
            year: year,
            hour: hour,
            minute: minute,
            second: second,
            daysInMonth: daysInMonth,
            firstDay: firstDay,
            lastDay: lastDay,
            lastMonth: lastMonth,
            lastYear: lastYear,
            daysInLastMonth: daysInLastMonth,
            dayOfWeek: dayOfWeek,
            // other vars
            calRows: Array.from(Array(6).keys()),
            calCols: Array.from(Array(7).keys()),
            classes: {},
            minDate: minDate,
            maxDate: maxDate,
            calendar: calendar
        };
        if (this.showDropdowns) {
            const currentMonth = getMonth(calendar[1][1]);
            const currentYear = getYear(calendar[1][1]);
            const realCurrentYear = getYear(new Date());
            const maxYear = (maxDate && getYear(maxDate)) || (realCurrentYear + 5);
            const minYear = (minDate && getYear(minDate)) || (realCurrentYear - 50);
            const inMinYear = currentYear === minYear;
            const inMaxYear = currentYear === maxYear;
            const years = [];
            for (let y = minYear; y <= maxYear; y++) {
                years.push(y);
            }
            this.calendarVariables[side].dropdowns = {
                currentMonth: currentMonth,
                currentYear: currentYear,
                maxYear: maxYear,
                minYear: minYear,
                inMinYear: inMinYear,
                inMaxYear: inMaxYear,
                monthArrays: Array.from(Array(12).keys()),
                yearArrays: years
            };
        }
        this._buildCells(calendar, side);
    }
    setStartDate(startDate) {
        if (typeof startDate === 'string') {
            this.startDate = parseISO(startDate, this.locale.format);
        }

        if (typeof startDate === 'object') {
            this.pickingDate = true;
            //TODO FIX
            this.startDate = startDate;
            // this.startDate = parseISO(startDate);
        }
        if (!this.timePicker) {
            this.pickingDate = true;
            this.startDate = startOfDay(this.startDate);
        }

        if (this.timePicker && this.timePickerIncrement) {
            this.startDate = setMinutes(this.startDate, Math.round(getMinutes(this.startDate) / this.timePickerIncrement) * this.timePickerIncrement);
            // this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
        }


        if (this.minDate && isBefore(this.startDate, this.minDate)) {
            this.startDate = this.minDate.clone();
            if (this.timePicker && this.timePickerIncrement) {
                this.startDate = setMinutes(this.startDate, Math.round(getMinutes(this.startDate) / this.timePickerIncrement) * this.timePickerIncrement);
            }

        }

        if (this.maxDate && isAfter(this.startDate, this.maxDate)) {
            this.startDate = this.maxDate.clone();
            if (this.timePicker && this.timePickerIncrement) {
                this.startDate = setMinutes(this.startDate, (Math.floor(getMinutes(this.startDate) / this.timePickerIncrement) * this.timePickerIncrement));
            }
        }

        if (!this.isShown) {
            this.updateElement();
        }
        this.startDateChanged.emit({ startDate: this.startDate });
        this.updateMonthsInView();
    }

    setEndDate(endDate) {
        if (typeof endDate === 'string') {
            this.endDate = parseISO(endDate, this.locale.format);
        }

        if (typeof endDate === 'object') {
            this.pickingDate = false;
            this.endDate = endDate;
            // this.endDate = parseISO(endDate);
        }
        if (!this.timePicker) {
            this.pickingDate = false;
            this.endDate = sub(startOfDay(add(this.endDate, { 'days': 1 })), { 'seconds': 1 });
            // .add(1, 'd').startOf('day').subtract(1, 'second');
        }

        if (this.timePicker && this.timePickerIncrement) {
            this.endDate = setMinutes(this.endDate, (Math.round(getMinutes(this.endDate) / this.timePickerIncrement) * this.timePickerIncrement));
        }


        if (isBefore(this.endDate, this.startDate)) {
            this.endDate = this.startDate;
        }

        if (this.maxDate && isAfter(this.endDate, this.maxDate)) {
            this.endDate = this.maxDate.clone();
        }

        if (this.dateLimit && isBefore(add(this.startDate, { 'days': this.dateLimit }), this.endDate)) {
            this.endDate = add(this.startDate, { 'days': this.dateLimit });
        }


        if (!this.isShown) {
            // this.updateElement();
        }
        this.endDateChanged.emit({ endDate: this.endDate });
        this.updateMonthsInView();
    }
    @Input()
    isInvalidDate(date) {
        return false;
    }
    @Input()
    isCustomDate(date) {
        return false;
    }
    @Input()
    isTooltipDate(date): string {
        return null;
    }

    updateView() {
        if (this.timePicker) {
            this.renderTimePicker(SideEnum.left);
            this.renderTimePicker(SideEnum.right);
        }
        this.updateMonthsInView();
        this.updateCalendars();
    }

    updateMonthsInView() {
        if (this.endDate) {
            // if both dates are visible already, do nothing
            if (!this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month &&
                ((this.startDate && this.leftCalendar &&
                    format(this.startDate, 'yyyy-MM') ===
                    format(this.leftCalendar.month, 'yyyy-MM')) ||
                    (this.startDate && this.rightCalendar && format(this.startDate, 'yyyy-MM') === format(this.rightCalendar.month, ('yyyy-MM')))
                    &&
                    (format(this.endDate, 'yyyy-MM') === format(this.leftCalendar.month, 'yyyy-MM') ||
                        format(this.endDate, 'yyyy-MM') === format(this.rightCalendar.month, 'yyyy-MM'))
                )) {
                return;
            }
            if (this.startDate) {
                this.leftCalendar.month = this.startDate;
                // && (getMonth(this.endDate) !== getMonth(this.startDate) ||
                //     getYear(this.endDate) !== getYear(this.startDate))
                if (!this.linkedCalendars) {
                    this.rightCalendar.month = this.endDate;
                } else {
                    this.rightCalendar.month = add(this.leftCalendar.month, { 'months': 1 });
                }

            }

        } else {
            if (format(this.leftCalendar.month, 'yyyy-MM') !== format(this.startDate, 'yyyy-MM') &&
                format(this.rightCalendar.month, 'yyyy-MM') !== format(this.startDate, 'yyyy-MM')) {
                this.leftCalendar.month = setDate(this.startDate, 1);
                this.rightCalendar.month = add(this.leftCalendar.month, { 'months': 1 });
            }
        }
        if (this.maxDate && this.linkedCalendars && !this.singleDatePicker && this.rightCalendar.month > this.maxDate) {
            this.rightCalendar.month = setDate(this.maxDate, 2);
            this.leftCalendar.month = sub(setDate(this.maxDate, 2), { months: 1 });
            // this.maxDate.clone().date(2).subtract(1, 'month');
        }
    }
    /**
     *  This is responsible for updating the calendars
     */
    updateCalendars() {
        this.renderCalendar(SideEnum.left);
        this.renderCalendar(SideEnum.right);

        if (this.endDate === null) { return; }
        this.calculateChosenLabel();
    }
    updateElement() {
        const formatString = this.locale.displayFormat ? this.locale.displayFormat : this.locale.format;
        if (!this.singleDatePicker && this.autoUpdateInput) {
            if (this.startDate && this.endDate) {
                // if we use ranges and should show range label on input
                if (this.rangesArray.length && this.showRangeLabelOnInput === true && this.chosenRange &&
                    this.locale.customRangeLabel !== this.chosenRange) {
                    this.chosenLabel = this.chosenRange;
                } else {

                    this.chosenLabel = format(this.startDate, formatString,this.locale.name) +
                        this.locale.separator + format(this.endDate, formatString,this.locale.name);
                }
            }
        } else if (this.autoUpdateInput) {
            this.chosenLabel = format(this.startDate, formatString,this.locale.name);
        }
    }

    remove() {
        this.isShown = false;
    }
    /**
     * this should calculate the label
     */
    calculateChosenLabel() {
        if (!this.locale || !this.locale.separator) {
            this._buildLocale();
        }
        let customRange = true;
        let i = 0;
        if (this.rangesArray.length > 0) {
            this.ranges.forEach((dateRange, i) => {


                // if (this.ranges[range]) {
                if (this.timePicker) {
                    const formatString = this.timePickerSeconds ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd HH:mm';
                    // ignore times when comparing dates if time picker seconds is not enabled
                    if (format(this.startDate, formatString) === format(dateRange.start, formatString)
                        && format(this.endDate, formatString) === format(dateRange.end, formatString)) {
                        customRange = false;
                        this.chosenRange = this.rangesArray[i].label;
                        // break;
                    }
                } else {
                    // ignore times when comparing dates if time picker is not enabled
                    if (format(this.startDate, 'yyyy-MM-dd') === format(dateRange.start, 'yyyy-MM-dd')
                        && format(this.endDate, 'yyyy-MM-dd') === format(dateRange.end, 'yyyy-MM-dd')) {
                        customRange = false;
                        this.chosenRange = this.rangesArray[i].label;
                        // break;
                    }
                }
                // }
            });
        }
        if (customRange) {
            if (this.showCustomRangeLabel) {
                this.chosenRange = this.locale.customRangeLabel;
            } else {
                this.chosenRange = null;
            }
            // if custom label: show calendar
            this.showCalInRanges = true;
        }


        this.updateElement();
    }

    clickApply(e?) {
        if (!this.singleDatePicker && this.startDate && !this.endDate) {
            this.endDate = this._getDateWithTime(this.startDate, SideEnum.right);

            this.calculateChosenLabel();
        }
        if (this.isInvalidDate && this.startDate && this.endDate) {
            // get if there are invalid date between range
            const d = this.startDate;
            //TODO FIX
            // while (isBefore(d, this.endDate)) {
            // if (this.isInvalidDate(d)) {
            //     this.endDate = sub(d, { days: 1 });
            //     this.calculateChosenLabel();
            //     break;
            // }
            // add(d, { 'days': 1 });
            // }
        }
        if (this.chosenLabel) {
            this.choosedDate.emit({ chosenLabel: this.chosenLabel, startDate: this.startDate, endDate: this.endDate });
        }

        this.datesUpdated.emit({ startDate: this.startDate, endDate: this.endDate });
        if (e || (this.closeOnAutoApply && !e)) {
            this.hide();
        }
    }

    clickCancel(e) {
        this.startDate = this._old.start;
        this.endDate = this._old.end;
        if (this.inline) {
            this.updateView();
        }
        this.hide();
    }
    /**
     * called when month is changed
     * @param monthEvent get value in event.target.value
     * @param side left or right
     */
    monthChanged(monthEvent: any, side: SideEnum) {
        const year = this.calendarVariables[side].dropdowns.currentYear;
        const month = parseInt(monthEvent.target.value, 10);
        this.monthOrYearChanged(month, year, side);
    }
    /**
     * called when year is changed
     * @param yearEvent get value in event.target.value
     * @param side left or right
     */
    yearChanged(yearEvent: any, side: SideEnum) {
        const month = this.calendarVariables[side].dropdowns.currentMonth;
        const year = parseInt(yearEvent.target.value, 10);
        this.monthOrYearChanged(month, year, side);
    }
    /**
     * called when time is changed
     * @param timeEvent  an event
     * @param side left or right
     */
    timeChanged(timeEvent: any, side: SideEnum) {
        let hour = parseInt(this.timepickerVariables[side].selectedHour, 10);
        const minute = parseInt(this.timepickerVariables[side].selectedMinute, 10);
        const second = this.timePickerSeconds ? parseInt(this.timepickerVariables[side].selectedSecond, 10) : 0;

        if (!this.timePicker24Hour) {
            const ampm = this.timepickerVariables[side].ampmModel;
            if (ampm === 'PM' && hour < 12) {
                hour += 12;
            }
            if (ampm === 'AM' && hour === 12) {
                hour = 0;
            }
        }

        if (side === SideEnum.left) {
            let start = this.startDate;
            start = setHours(start, hour);
            start = setMinutes(start, minute);
            start = setSeconds(start, second);
            // start.minute(minute);
            // start.second(second);
            this.setStartDate(start);
            if (this.singleDatePicker) {
                this.endDate = this.startDate;
            } else if (this.endDate && format(this.endDate, 'yyyy-MM-dd') === format(start, 'yyyy-MM-dd') && isBefore(this.endDate, start)) {
                this.setEndDate(start);
            } else if (!this.endDate && this.timePicker) {
                const startClone = this._getDateWithTime(start, SideEnum.right);

                if (isBefore(startClone, start)) {
                    this.timepickerVariables[SideEnum.right].selectedHour = hour;
                    this.timepickerVariables[SideEnum.right].selectedMinute = minute;
                    this.timepickerVariables[SideEnum.right].selectedSecond = second;
                }
            }
        } else if (this.endDate) {
            let end = this.endDate;
            end = setHours(end, hour);
            end = setMinutes(end, minute);
            end = setSeconds(end, second);
            // end.(minute);
            // end.second(second);
            this.setEndDate(end);
        }

        // update the calendars so all clickable dates reflect the new time component
        this.updateCalendars();

        // re-render the time pickers because changing one selection can affect what's enabled in another
        this.renderTimePicker(SideEnum.left);
        this.renderTimePicker(SideEnum.right);

        if (this.autoApply) {
            this.clickApply();
        }
    }
    /**
     *  call when month or year changed
     * @param month month number 0 -11
     * @param year year eg: 1995
     * @param side left or right
     */
    monthOrYearChanged(month: number, year: number, side: SideEnum) {
        const isLeft = side === SideEnum.left;

        if (!isLeft) {
            if (year < getYear(this.startDate) || (year === getYear(this.startDate) && month < getMonth(this.startDate))) {
                month = getMonth(this.startDate);
                year = getYear(this.startDate);
            }
        }

        if (this.minDate) {
            if (year < getYear(this.minDate) || (year === getYear(this.minDate) && month < getMonth(this.minDate))) {
                month = getMonth(this.minDate);
                year = getYear(this.minDate);
            }
        }

        if (this.maxDate) {
            if (year > getYear(this.maxDate) || (year === getYear(this.maxDate) && month > getMonth(this.maxDate))) {
                month = getMonth(this.maxDate);
                year = getYear(this.maxDate);
            }
        }
        this.calendarVariables[side].dropdowns.currentYear = year;
        this.calendarVariables[side].dropdowns.currentMonth = month;
        if (isLeft) {
            this.leftCalendar.month = setYear(setMonth(this.leftCalendar.month, month), year);
            if (this.linkedCalendars) {
                this.rightCalendar.month = add(this.leftCalendar.month, { months: 1 });
                // add(1, 'month');
            }
        } else {
            this.rightCalendar.month = setYear(setMonth(this.rightCalendar.month, month), year);
            // this.rightCalendar.month.month(month).year(year);
            if (this.linkedCalendars) {
                this.leftCalendar.month = sub(this.rightCalendar.month, { months: 1 });
            }
        }
        this.updateCalendars();
    }

    /**
     * Click on previous month
     * @param side left or right calendar
     */
    clickPrev(side: SideEnum) {
        if (side === SideEnum.left) {
            this.leftCalendar.month = sub(this.leftCalendar.month, { months: 1 });
            if (this.linkedCalendars) {
                this.rightCalendar.month = sub(this.rightCalendar.month, { months: 1 });
                // this.rightCalendar.month.subtract(1, 'month');
            }
        } else {
            this.rightCalendar.month = sub(this.rightCalendar.month, { months: 1 });
            // this.rightCalendar.month.subtract(1, 'month');
        }
        this.updateCalendars();
    }
    /**
     * Click on next month
     * @param side left or right calendar
     */
    clickNext(side: SideEnum) {
        if (side === SideEnum.left) {
            this.leftCalendar.month = add(this.leftCalendar.month, { months: 1 });
            // this.leftCalendar.month.add(1, 'month');
        } else {
            this.rightCalendar.month = add(this.rightCalendar.month, { months: 1 });
            // this.rightCalendar.month.add(1, 'month');
            if (this.linkedCalendars) {
                this.leftCalendar.month = add(this.leftCalendar.month, { months: 1 });
                // this.leftCalendar.month.add(1, 'month');
            }
        }
        this.updateCalendars();
    }

    /**
     * When hovering a date
     * @param e event: get value by e.target.value
     * @param side left or right
     * @param row row position of the current date clicked
     * @param col col position of the current date clicked
     */
    hoverDate(e, side: SideEnum, row: number, col: number) {
        const leftCalDate = this.calendarVariables.left.calendar[row][col];
        const rightCalDate = this.calendarVariables.right.calendar[row][col];
        if (this.pickingDate) {
            this.nowHoveredDate = side === SideEnum.left ? leftCalDate : rightCalDate;
            this.renderCalendar(SideEnum.left);
            this.renderCalendar(SideEnum.right);
        }
        const tooltip = side === SideEnum.left ? this.tooltiptext[leftCalDate] : this.tooltiptext[rightCalDate];
        if (tooltip.length > 0) {
            e.target.setAttribute('title', tooltip);
        }
    }
    /**
     * When selecting a date
     * @param e event: get value by e.target.value
     * @param side left or right
     * @param row row position of the current date clicked
     * @param col col position of the current date clicked
     */
    clickDate(e, side: SideEnum, row: number, col: number) {
        if (e.target.tagName === 'TD') {
            if (!e.target.classList.contains('available')) {
                return;
            }
        } else if (e.target.tagName === 'SPAN') {
            if (!e.target.parentElement.classList.contains('available')) {
                return;
            }
        }
        if (this.rangesArray.length) {
            this.chosenRange = this.locale.customRangeLabel;
        }

        let date = side === SideEnum.left ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];

        if ((this.endDate || (isBefore(date, this.startDate)
            && this.customRangeDirection === false)) && this.lockStartDate === false) { // picking start
            if (this.timePicker) {
                date = this._getDateWithTime(date, SideEnum.left);
            }
            this.endDate = null;
            this.setStartDate(date);
        } else if (!this.endDate && isBefore(date, this.startDate) && this.customRangeDirection === false) {
            // special case: clicking the same date for start/end,
            // but the time of the end date is before the start date
            this.setEndDate(this.startDate);
        } else { // picking end
            if (this.timePicker) {
                date = this._getDateWithTime(date, SideEnum.right);
            }
            // 'day'
            if (isBefore(date, this.startDate) === true && this.customRangeDirection === true) {
                this.setEndDate(this.startDate);
                this.setStartDate(date);
            } else {
                this.setEndDate(date);
            }

            if (this.autoApply) {
                this.calculateChosenLabel();
            }
        }

        if (this.singleDatePicker) {
            this.setEndDate(this.startDate);
            this.updateElement();
            if (this.autoApply) {
                this.clickApply();
            }
        }

        this.updateView();

        if (this.autoApply && this.startDate && this.endDate) {
            this.clickApply();
        }

        // This is to cancel the blur event handler if the mouse was in one of the inputs
        e.stopPropagation();

    }
    /**
     *  Click on the custom range
     * @param e: Event
     * @param label
     */
    clickRange(e, label) {
        this.chosenRange = label.label;
        console.log('label===>', label);
        console.log('this.locale.customRangeLabel===>', this.locale.customRangeLabel);
        if (label.label === this.locale.customRangeLabel) {
            this.isShown = true; // show calendars
            this.showCalInRanges = true;
        } else {
            const dates = this.rangesArray.filter((dateRange) => { return dateRange.label === label.label })[0];
            console.log("dates", dates);
            this.startDate = dates.start;
            this.endDate = dates.end;
            if (this.showRangeLabelOnInput && label !== this.locale.customRangeLabel) {
                this.chosenLabel = label;
            } else {
                this.calculateChosenLabel();
            }
            this.showCalInRanges = (!this.rangesArray.length) || this.alwaysShowCalendars;

            if (!this.timePicker) {
                // .startOf('day')
                this.startDate = startOfDay(this.startDate);
                this.endDate = endOfDay(this.endDate);
                // this.endDate.endOf('day');
            }

            if (!this.alwaysShowCalendars) {
                this.isShown = false; // hide calendars
            }
            this.rangeClicked.emit({ label: label, start: dates.start, end: dates.end });
            if (!this.keepCalendarOpeningWithRange || this.autoApply) {
                this.clickApply();
            } else {
                if (!this.alwaysShowCalendars) {
                    return this.clickApply();
                }
                if (this.maxDate && isSameMonth(this.maxDate, dates.start)) {
                    this.rightCalendar.month = setMonth(this.rightCalendar.month, getMonth(dates.start));
                    this.rightCalendar.month = setYear(this.rightCalendar.month, getYear(dates.start));
                    //   this.rightCalendar.month.month(dates[0].month());
                    // this.rightCalendar.month.year(dates[0].year());
                    this.leftCalendar.month = setMonth(this.leftCalendar.month, getMonth(sub(dates.start, { months: 1 })));
                    this.leftCalendar.month = setYear(this.leftCalendar.month, getYear(dates.end));
                    // this.leftCalendar.month.month(dates[0].month() - 1);
                    // this.leftCalendar.month.year(dates[1].year());
                } else {
                    this.leftCalendar.month = setMonth(this.leftCalendar.month, getMonth(dates.start));
                    this.leftCalendar.month = setYear(this.leftCalendar.month, getYear(dates.start));
                    // this.leftCalendar.month.month(dates[0].month());
                    // this.leftCalendar.month.year(dates[0].year());
                    // get the next year
                    const nextMonth = add(dates.start, { 'months': 1 });
                    this.rightCalendar.month = setMonth(this.rightCalendar.month, getMonth(nextMonth));
                    this.rightCalendar.month = setYear(this.rightCalendar.month, getYear(nextMonth));
                    // this.rightCalendar.month.month(nextMonth.month());
                    // this.rightCalendar.month.year(nextMonth.year());
                }
                this.updateCalendars();
                if (this.timePicker) {
                    this.renderTimePicker(SideEnum.left);
                    this.renderTimePicker(SideEnum.right);
                }
            }

        }

    }



    show(e?) {
        if (this.isShown) { return; }
        this._old.start = this.startDate;
        this._old.end = this.endDate;
        this.isShown = true;
        this.updateView();
    }

    hide(e?) {
        if (!this.isShown) {
            return;
        }
        // incomplete date selection, revert to last values
        if (!this.endDate) {
            if (this._old.start) {
                this.startDate = this._old.start;
            }
            if (this._old.end) {
                this.endDate = this._old.end;
            }
        }

        // if a new date range was selected, invoke the user callback function
        if (!isSameSecond(this.startDate, this._old.start) || !isSameSecond(this.endDate, this._old.end)) {
            // this.callback(this.startDate, this.endDate, this.chosenLabel);
        }

        // if picker is attached to a text input, update it
        this.updateElement();
        this.isShown = false;
        this._ref.detectChanges();

    }

    /**
     * handle click on all element in the component, useful for outside of click
     * @param e event
     */
    handleInternalClick(e) {
        e.stopPropagation();
    }
    /**
     * update the locale options
     * @param locale
     */
    updateLocale(locale) {
        for (const key in locale) {
            if (locale.hasOwnProperty(key)) {
                this.locale[key] = locale[key];
                if (key === 'customRangeLabel') {
                    this.renderRanges();
                }
            }
        }
    }
    /**
     *  clear the daterange picker
     */
    clear() {
        this.startDate = startOfToday();
        this.endDate = endOfToday();
        this.choosedDate.emit({ chosenLabel: '', startDate: null, endDate: null });
        this.datesUpdated.emit({ startDate: null, endDate: null });
        this.hide();
    }

    /**
     * Find out if the selected range should be disabled if it doesn't
     * fit into minDate and maxDate limitations.
     */
    disableRange(range) {
        if (range === this.locale.customRangeLabel) {
            return false;
        }
        const rangeMarkers = this.ranges.filter((filterData) => { filterData == range.label })[0];
        let areBothBefore: boolean = false;
        let areBothAfter: boolean = false;
        if (this.minDate) {
            areBothBefore = isBefore(rangeMarkers.start, this.minDate);
        }
        if (this.maxDate) {
            areBothAfter = isBefore(rangeMarkers.end, this.maxDate);
        }

        return (areBothBefore || areBothAfter);
    }
    /**
     *
     * @param date the date to add time
     * @param side left or right
     */
    private _getDateWithTime(date, side: SideEnum): any {
        let hour = parseInt(this.timepickerVariables[side].selectedHour, 10);
        if (!this.timePicker24Hour) {
            const ampm = this.timepickerVariables[side].ampmModel;
            if (ampm === 'PM' && hour < 12) {
                hour += 12;
            }
            if (ampm === 'AM' && hour === 12) {
                hour = 0;
            }
        }
        const minute = parseInt(this.timepickerVariables[side].selectedMinute, 10);
        const second = this.timePickerSeconds ? parseInt(this.timepickerVariables[side].selectedSecond, 10) : 0;
        return setSeconds(setMinutes(setHours(date, hour), minute), second);
    }
    /**
     *  build the locale config
     */
    private _buildLocale() {
        this.locale = { ...this._localeService.config, ...this.locale };
        if (!this.locale.format) {
            if (this.timePicker) {
                this.locale.format = 'MMM d yyyy HH:mm a';
            } else {
                this.locale.format = 'dd/MM/yyyy';
            }
        }
    }
    private _buildCells(calendar, side: SideEnum) {
        for (let row = 0; row < 6; row++) {
            this.calendarVariables[side].classes[row] = {};
            const rowClasses = [];
            if (
                this.emptyWeekRowClass &&
                Array.from(Array(7).keys()).some(i => getMonth(calendar[row][i]) !== getMonth(this.calendarVariables[side]))
            ) {
                rowClasses.push(this.emptyWeekRowClass);
            }
            for (let col = 0; col < 7; col++) {
                const classes = [];
                // empty week row class
                if (this.emptyWeekColumnClass) {
                    if (getMonth(calendar[row][col]) !== getMonth(this.calendarVariables[side])) {
                        classes.push(this.emptyWeekColumnClass);
                    }
                }
                // highlight today's date
                if (isSameDay(calendar[row][col], new Date())) {
                    classes.push('today');
                }
                // highlight weekends
                if (isWeekend(calendar[row][col])) {
                    classes.push('weekend');
                }
                // grey out the dates in other months displayed at beginning and end of this calendar
                if (getMonth(calendar[row][col]) !== getMonth(calendar[1][1])) {
                    classes.push('off');

                    // mark the last day of the previous month in this calendar
                    if (
                        this.lastDayOfPreviousMonthClass && (getMonth(calendar[row][col]) < getMonth(calendar[1][1]) ||
                            getMonth(calendar[1][1]) === 0) && getDate(calendar[row][col]) === this.calendarVariables[side].daysInLastMonth
                    ) {
                        classes.push(this.lastDayOfPreviousMonthClass);
                    }

                    // mark the first day of the next month in this calendar
                    if (
                        this.firstDayOfNextMonthClass && (getMonth(calendar[row][col]) > getMonth(calendar[1][1]) ||
                            getMonth(calendar[row][col]) === 0) && getDate(calendar[row][col]) === 1
                    ) {
                        classes.push(this.firstDayOfNextMonthClass);
                    }
                }
                // mark the first day of the current month with a custom class
                if (
                    this.firstMonthDayClass && getMonth(calendar[row][col]) === getMonth(calendar[1][1]) &&
                    getDate(calendar[row][col]) === getDate(calendar.firstDay)
                ) {
                    classes.push(this.firstMonthDayClass);
                }
                // mark the last day of the current month with a custom class
                if (
                    this.lastMonthDayClass && getMonth(calendar[row][col]) === getMonth(calendar[1][1]) &&
                    getDate(calendar[row][col]) === getDate(calendar.lastDay)) {
                    classes.push(this.lastMonthDayClass);
                }
                // don't allow selection of dates before the minimum date
                // TODO CHECK, 'day'
                if (this.minDate && isBefore(calendar[row][col], this.minDate)) {
                    classes.push('off', 'disabled');
                }
                // don't allow selection of dates after the maximum date
                // TODO CHECK, 'day'
                if (this.calendarVariables[side].maxDate && isAfter(calendar[row][col], this.calendarVariables[side].maxDate)) {
                    classes.push('off', 'disabled');
                }
                // don't allow selection of date if a custom function decides it's invalid
                if (this.isInvalidDate(calendar[row][col])) {
                    classes.push('off', 'disabled', 'invalid');
                }
                // highlight the currently selected start date
                if (this.startDate && format(calendar[row][col], 'yyyy-MM-dd') === format(this.startDate, 'yyyy-MM-dd')) {
                    classes.push('active', 'start-date');
                }
                // highlight the currently selected end date
                if (this.endDate != null && format(calendar[row][col], 'yyyy-MM-dd') === format(this.endDate, 'yyyy-MM-dd')) {
                    classes.push('active', 'end-date');
                }
                // highlight dates in-between the selected dates
                if (
                    (
                        (this.nowHoveredDate != null && this.pickingDate) || this.endDate != null
                    ) &&
                    (
                        calendar[row][col] > this.startDate &&
                        (
                            calendar[row][col] < this.endDate || (calendar[row][col] < this.nowHoveredDate && this.pickingDate)
                        )
                    ) &&
                    (
                        !classes.find(el => el === 'off')
                    )
                ) {
                    classes.push('in-range');
                }
                // apply custom classes for this date
                const isCustom = this.isCustomDate(calendar[row][col]);
                if (isCustom !== false) {
                    if (typeof isCustom === 'string') {
                        classes.push(isCustom);
                    } else {
                        Array.prototype.push.apply(classes, isCustom);
                    }
                }
                // apply custom tooltip for this date
                const isTooltip = this.isTooltipDate(calendar[row][col]);
                if (isTooltip) {
                    if (typeof isTooltip === 'string') {
                        this.tooltiptext[calendar[row][col]] = isTooltip; // setting tooltiptext for custom date
                    } else {
                        this.tooltiptext[calendar[row][col]] = 'Put the tooltip as the returned value of isTooltipDate';
                    }
                } else {
                    this.tooltiptext[calendar[row][col]] = '';
                }
                // store classes var
                let cname = '', disabled = false;
                for (let i = 0; i < classes.length; i++) {
                    cname += classes[i] + ' ';
                    if (classes[i] === 'disabled') {
                        disabled = true;
                    }
                }
                if (!disabled) {
                    cname += 'available';
                }
                this.calendarVariables[side].classes[row][col] = cname.replace(/^\s+|\s+$/g, '');
            }
            this.calendarVariables[side].classes[row].classList = rowClasses.join(' ');
        }
    }
    getMonthNumber(date) {
        if (date !== '' || date != null) {
            return getMonth(date);
        }
    }
    formatDate(date, formatString = 'dd/MM/yyyy') {
        if (date !== '' || date != null) {
            return format(date, formatString);
        }
    }
    isBeforeDate(date1, date2) {
        return isBefore(date1, date2);
    }
    getDate(date) {
        if (date !== '' || date != null) {
            return getDate(date);
        }
    }
    isoWeekNumber(date) {
        if (date !== '' || date != null) {
            return getWeek(date);
        }
    }
    getWeekNumber(date) {
        if (date !== '' || date != null) {
            return getISOWeek(date);
        }
    }
}
