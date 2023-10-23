import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";
import {EnumValueDto} from "../../../../../services/swagger";

@Component({
    selector: 'tut-star-map',
    templateUrl: './tutorial-star-map.component.html',
    styleUrls: ['./tutorial-star-map.component.scss']
})
export class TutorialStarMapComponent {

    public static TOPIC: Topic = {
        uuid: EnumValueDto.ETutorialCategoriesEnum.STAR_MAP,
        title: 'System Map',
        subTitle: 'How to use and interpret the map'
    }

    uuid: string = TutorialStarMapComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
