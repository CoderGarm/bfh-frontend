import {Component} from '@angular/core';
import {Topic} from "../../../TutorialScopeService";

@Component({
    selector: 'app-fleet-dash',
    templateUrl: './fleet-dash.component.html',
    styleUrls: ['./fleet-dash.component.scss']
})
export class FleetDashComponent implements Topic {

    uuid: string = 'dash-fleet-journal';
    /* pretty ugly workaround to display only the correct tutorial */
    static UUID: string = 'dash-fleet-journal';
    title: string = 'Fleet Dashboard';
    subTitle: string = 'All about fleets';
}
