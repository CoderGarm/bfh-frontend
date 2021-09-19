import {Component, Input, OnInit} from '@angular/core';
import {AmmunitionModule} from "../../../services/swagger";

@Component({
  selector: 'app-ammunition-module-display',
  templateUrl: './ammunition-module-display.component.html',
  styleUrls: ['./ammunition-module-display.component.scss']
})
export class AmmunitionModuleDisplayComponent implements OnInit {

  /**
   * the module which should be displayed
   */
  @Input()
  moduleInput!: AmmunitionModule;

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
