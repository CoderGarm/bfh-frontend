import {Component, Input, OnInit} from '@angular/core';
import {Fleet} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-fleet-sidenav',
    templateUrl: './fleet-sidenav.component.html',
    styleUrls: ['./fleet-sidenav.component.scss']
})
export class FleetSidenavComponent extends SubscriptionManager implements OnInit {

    static path: string = 'fleet';

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
     * the user selected fleet
     */
    @Input()
    selectedFleetInput?: Fleet;

    constructor() {
        super();
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
