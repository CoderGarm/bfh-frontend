import {Component, Input, OnInit} from '@angular/core';
import {Weapon} from "../../../services/swagger";

@Component({
  selector: 'app-weapon-module-display',
  templateUrl: './weapon-module-display.component.html',
  styleUrls: ['./weapon-module-display.component.scss']
})
export class WeaponModuleDisplayComponent implements OnInit {

  /**
   * the module which should be displayed
   */
  @Input()
  moduleInput!: Weapon;

  /**
   * the amount to display
   */
  @Input()
  amountInput?: number;

  @Input()
  alignmentInput?: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
