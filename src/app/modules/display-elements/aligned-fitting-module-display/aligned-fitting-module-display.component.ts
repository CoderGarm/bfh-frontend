import {Component, Input, OnInit} from '@angular/core';
import {AlignedFitting} from "../../../services/swagger";

@Component({
  selector: 'app-aligned-fitting-module-display',
  templateUrl: './aligned-fitting-module-display.component.html',
  styleUrls: ['./aligned-fitting-module-display.component.scss']
})
export class AlignedFittingModuleDisplayComponent implements OnInit {

  /**
   * the fitting which should be displayed
   */
  @Input()
  fittingInput!: AlignedFitting;

  constructor() {
  }

  ngOnInit(): void {
  }

}
