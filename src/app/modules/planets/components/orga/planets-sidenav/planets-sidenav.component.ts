import {Component, Input, OnInit} from '@angular/core';
import {Planet} from "../../../../../services/swagger";

@Component({
    selector: 'app-planets-sidenav',
    templateUrl: './planets-sidenav.component.html',
    styleUrls: ['./planets-sidenav.component.scss']
})
export class PlanetsSidenavComponent implements OnInit {

    static path: string = 'planets';

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
     * Just the user-selected planet.
     */
    @Input()
    selectedPlanetInput?: Planet;

    constructor() {
    }

    ngOnInit(): void {
        // todo strange effect: planet page will not loaded without toggling the sidenav
        this.onSideNavToggle();
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
