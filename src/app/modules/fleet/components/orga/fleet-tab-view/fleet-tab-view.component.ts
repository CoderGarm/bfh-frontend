import {Component, Input, OnInit} from '@angular/core';
import {Fleet} from "../../../../../services/swagger";

@Component({
    selector: 'app-fleet-tab-view',
    templateUrl: './fleet-tab-view.component.html',
    styleUrls: ['./fleet-tab-view.component.scss']
})
export class FleetTabViewComponent implements OnInit {

    actionTabTitles: string[] = ['Dashboard', 'Movement'];

    /**
     * the user selected fleet
     */
    @Input()
    selectedFleetInput?: Fleet;

    constructor() {
    }

    ngOnInit(): void {
    }

}
