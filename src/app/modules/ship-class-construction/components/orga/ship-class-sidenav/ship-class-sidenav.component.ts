import {Component, Input, OnInit} from '@angular/core';
import {ShipClass} from "../../../../../services/swagger";

@Component({
    selector: 'app-ship-class-sidenav',
    templateUrl: './ship-class-sidenav.component.html',
    styleUrls: ['./ship-class-sidenav.component.scss']
})
export class ShipClassSidenavComponent implements OnInit {

    static path: string = 'ship-classes';

    /**
     * Defines if the sidenav should be open.
     */
    public sideNavOpen: boolean = true;

    /**
     * Defines if the open state of the sidenav is allowed to be changed.
     * @private
     */
    private sideNavNoop: boolean = false;

    /**
     * The user selected ShipClass.
     */
    @Input()
    selectedShipClassInput?: ShipClass;

    /**
     * detects the successful modification of a ship class
     */
    @Input()
    modifiedShipClassInput?: ShipClass;

    constructor() {
    }

    ngOnInit(): void {
    }

    /**
     * Toggles the sidenav's opened state.
     */
    onSideNavToggle() {
        if (!this.sideNavNoop) {
            this.sideNavOpen = !this.sideNavOpen
        }
        this.sideNavNoop = true;

        setTimeout(() => {
            this.sideNavNoop = false;
        }, 200);
    }
}
