import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LocaleConfig } from '../../../../src/daterangepicker';

@Component({
  selector: 'reactive-form',
  templateUrl: './reactive-form.component.html',
  styleUrls: ['./reactive-form.component.scss']
})
export class ReactiveFormComponent {
  form: FormGroup;
  form2: FormGroup;
  locale: LocaleConfig = {
    format: 'yyyy-MM-dd hh:mm:ss ',
    displayFormat: 'yyyy-MM-dd',
  };

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      selected: [{
        startDate: new Date(2015, 11, 24),
        endDate: new Date(2015, 11, 26)
      }, Validators.required],
    });

    this.form2 = this.fb.group({
      selected: [{
        startDate: new Date(2019, 12, 11, 18, 30),
        endDate: new Date(2019, 12, 12, 18, 29, 59),
      }, Validators.required],
    });
  }

  submit() {
    console.log(this.form.value);
  }

  submit2() {
    console.log(this.form2.value);
  }
  toggleDisable(form: FormGroup) {
    if (form.disabled) {
      form.enable();
    } else {
      form.disable();
    }
  }
}
