import {Component, Input, OnInit} from '@angular/core';
import {Sidewall} from "../../../services/swagger";

@Component({
  selector: 'app-sidewall-module-display',
  templateUrl: './sidewall-module-display.component.html',
  styleUrls: ['./sidewall-module-display.component.scss']
})
export class SidewallModuleDisplayComponent implements OnInit {

  /**
   * the module which should be displayed
   */
  @Input()
  moduleInput!: Sidewall;

  constructor() {
  }

  ngOnInit(): void {
  }

}
