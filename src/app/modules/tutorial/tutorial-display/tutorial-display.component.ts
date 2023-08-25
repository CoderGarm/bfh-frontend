import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {FleetDashComponent} from "../topics/journalTabView/fleet-dash/fleet-dash.component";
import {Topic} from "../TutorialScopeService";

@Component({
    selector: 'app-tutorial-display',
    templateUrl: './tutorial-display.component.html',
    styleUrls: ['./tutorial-display.component.scss']
})
export class TutorialDisplayComponent {

    protected readonly FleetDashComponent = FleetDashComponent;

    constructor(@Inject(MAT_DIALOG_DATA) public data: Topic) {
    }

}
