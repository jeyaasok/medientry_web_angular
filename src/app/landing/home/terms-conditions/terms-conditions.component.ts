import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrl: './terms-conditions.component.scss'
})
export class TermsConditionsComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
