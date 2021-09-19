import {Component, Input, OnInit} from '@angular/core';
import {ElectronicWarfare} from "../../../services/swagger";

@Component({
  selector: 'app-eloka-module-display',
  templateUrl: './eloka-module-display.component.html',
  styleUrls: ['./eloka-module-display.component.scss']
})
export class ElokaModuleDisplayComponent implements OnInit {

  /**
   * the module which should be displayed
   */
  @Input()
  moduleInput!: ElectronicWarfare;

  constructor() {
  }

  ngOnInit(): void {
  }

}
