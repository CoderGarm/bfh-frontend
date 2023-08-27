import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";

@Component({
    selector: 'tut-planet-dash',
    templateUrl: './tutorial-planet-dash.component.html',
    styleUrls: ['./tutorial-planet-dash.component.scss']
})
export class TutorialPlanetDashComponent {

    public static TOPIC: Topic = {
        uuid: 'planet-dash',
        title: 'Planetary Dashboard',
        subTitle: 'Information collection'
    }

    uuid: string = TutorialPlanetDashComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
