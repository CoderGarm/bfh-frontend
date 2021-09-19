import {Component, Input, OnInit} from '@angular/core';
import {PassiveModule} from "../../../services/swagger";

@Component({
  selector: 'app-passive-module-display',
  templateUrl: './passive-module-display.component.html',
  styleUrls: ['./passive-module-display.component.scss']
})
export class PassiveModuleDisplayComponent implements OnInit {

  /**
   * the module which should be displayed
   */
  @Input()
  moduleInput!: PassiveModule;

  /**
   * the amount to display
   */
  @Input()
  amountInput?: number;

  constructor() {
  }

  ngOnInit(): void {
  }

}
