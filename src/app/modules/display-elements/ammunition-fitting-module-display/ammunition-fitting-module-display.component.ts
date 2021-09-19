import {Component, Input, OnInit} from '@angular/core';
import {AmmunitionFitting} from "../../../services/swagger";

@Component({
  selector: 'app-ammunition-fitting-module-display',
  templateUrl: './ammunition-fitting-module-display.component.html',
  styleUrls: ['./ammunition-fitting-module-display.component.scss']
})
export class AmmunitionFittingModuleDisplayComponent implements OnInit {

  /**
   * the fitting which should be displayed
   */
  @Input()
  fittingInput!: AmmunitionFitting;

  constructor() {
  }

  ngOnInit(): void {
  }

}
