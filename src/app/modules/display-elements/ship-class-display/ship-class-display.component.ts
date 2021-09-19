import {AfterViewInit, Component, Input} from '@angular/core';
import {ShipClass} from "../../../services/swagger";

@Component({
  selector: 'app-ship-class-display',
  templateUrl: './ship-class-display.component.html',
  styleUrls: ['./ship-class-display.component.scss']
})
export class ShipClassDisplayComponent implements AfterViewInit {

  /**
   * the ship class which should be displayed
   */
  @Input()
  shipClassInput!: ShipClass;

  constructor() {
  }

  ngAfterViewInit(): void {
  }
}
