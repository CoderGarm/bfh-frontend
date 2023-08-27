import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";

@Component({
    selector: 'tut-fleet-dash',
    templateUrl: './tutorial-fleet-dash.component.html',
    styleUrls: ['./tutorial-fleet-dash.component.scss']
})
export class TutorialFleetDashComponent {

    public static TOPIC: Topic = {
        uuid: 'dash-fleet-journal',
        title: 'Fleet Dashboard',
        subTitle: 'All about fleets'
    }

    uuid: string = TutorialFleetDashComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
