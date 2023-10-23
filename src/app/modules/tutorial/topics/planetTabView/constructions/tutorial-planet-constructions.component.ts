import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";
import {EnumValueDto} from "../../../../../services/swagger";

@Component({
    selector: 'tut-planet-constructions',
    templateUrl: './tutorial-planet-constructions.component.html',
    styleUrls: ['./tutorial-planet-constructions.component.scss']
})
export class TutorialPlanetConstructionsComponent {

    public static TOPIC: Topic = {
        uuid: EnumValueDto.ETutorialCategoriesEnum.PLANET_CONSTRUCTIONS,
        title: 'Ground Constructions',
        subTitle: 'Infrastructure development'
    }

    uuid: string = TutorialPlanetConstructionsComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
