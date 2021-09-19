import {Component, Input, OnInit} from '@angular/core';
import {Propulsion} from "../../../services/swagger";

@Component({
  selector: 'app-propulsion-module-display',
  templateUrl: './propulsion-module-display.component.html',
  styleUrls: ['./propulsion-module-display.component.scss']
})
export class PropulsionModuleDisplayComponent implements OnInit {

  /**
   * the module which should be displayed
   */
  @Input()
  moduleInput!: Propulsion;

  constructor() {
  }

  ngOnInit(): void {
  }

}
