import {AfterViewInit, Component, Inject, Input, Optional} from '@angular/core';
import {Fleet} from "../../../services/swagger";

@Component({
    selector: 'app-fleet-display',
    templateUrl: './fleet-display.component.html',
    styleUrls: ['./fleet-display.component.scss']
})
export class FleetDisplayComponent implements AfterViewInit {

    /**
     * the fleet to display
     */
    @Input()
    fleetInput?: Fleet;

    isOpen: boolean = false;

    constructor(@Optional() @Inject('fleetInput') fleet: Fleet | undefined) {
        this.fleetInput = fleet;
    }

    ngAfterViewInit(): void {
    }

    /**
     * constructs and returns the url to the icon
     */
    getLink(): string {
        //todo amend fleet size icon
        return "assets/icons/fleets/png64x/small_fleet_c.png";
    }

    setOpened() {
        this.isOpen = true;
    }

    setClosed() {
        this.isOpen = false;
    }
}
