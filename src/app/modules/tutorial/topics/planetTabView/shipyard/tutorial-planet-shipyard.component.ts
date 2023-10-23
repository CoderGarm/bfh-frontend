import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";
import {EnumValueDto} from "../../../../../services/swagger";

@Component({
    selector: 'tut-planet-shipyard',
    templateUrl: './tutorial-planet-shipyard.component.html',
    styleUrls: ['./tutorial-planet-shipyard.component.scss']
})
export class TutorialPlanetShipyardComponent {

    public static TOPIC: Topic = {
        uuid: EnumValueDto.ETutorialCategoriesEnum.PLANET_SHIPYARD,
        title: 'Planetary shipyard',
        subTitle: 'Constructing warships'
    }

    uuid: string = TutorialPlanetShipyardComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
