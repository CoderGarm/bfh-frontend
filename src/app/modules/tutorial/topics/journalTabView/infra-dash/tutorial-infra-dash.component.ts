import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";

@Component({
    selector: 'tut-infra-dash',
    templateUrl: './tutorial-infra-dash.component.html',
    styleUrls: ['./tutorial-infra-dash.component.scss']
})
export class TutorialInfraDashComponent {

    public static TOPIC: Topic = {
        uuid: 'dash-infra-journal',
        title: 'Infrastructure Dashboard',
        subTitle: 'All about infrastructure'
    }

    uuid: string = TutorialInfraDashComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
