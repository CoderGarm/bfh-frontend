import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";

@Component({
    selector: 'tut-planet-shipyard',
    templateUrl: './tutorial-planet-shipyard.component.html',
    styleUrls: ['./tutorial-planet-shipyard.component.scss']
})
export class TutorialPlanetShipyardComponent {

    public static TOPIC: Topic = {
        uuid: 'tut-planet-shipyard',
        title: 'Planetary shipyard',
        subTitle: 'Constructing warships'
    }

    uuid: string = TutorialPlanetShipyardComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
