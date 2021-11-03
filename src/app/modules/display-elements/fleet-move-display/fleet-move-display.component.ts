import {Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {Fleet} from "../../../services/swagger";
import {SubscriptionManager} from "../../../SubscriptionManager";

@Component({
  selector: 'app-fleet-move-display',
  templateUrl: './fleet-move-display.component.html',
  styleUrls: ['./fleet-move-display.component.scss']
})
export class FleetMoveDisplayComponent extends SubscriptionManager implements OnInit {

  /**
   * the fleet which will take all the other war ships
   */
  @Input()
  fleetInput?: Fleet;

  constructor(@Optional() @Inject('fleetInput') fleet: Fleet | undefined) {
    super();
    this.fleetInput = fleet;
  }

  ngOnInit(): void {
  }

  getTicksLeft() {
    return this.fleetInput!.move!.originalDuration - this.fleetInput!.move!.moveDoneAtZero;
  }
}
