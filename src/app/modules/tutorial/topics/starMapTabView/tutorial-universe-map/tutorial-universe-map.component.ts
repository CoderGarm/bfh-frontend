import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";
import {EnumValueDto} from "../../../../../services/swagger";

@Component({
    selector: 'tut-universe-map',
    templateUrl: './tutorial-universe-map.component.html',
    styleUrls: ['./tutorial-universe-map.component.scss']
})
export class TutorialUniverseMapComponent {

    public static TOPIC: Topic = {
        uuid: EnumValueDto.ETutorialCategoriesEnum.UNIVERSE_MAP,
        title: 'Galaxy Map',
        subTitle: 'How to use and interpret the map'
    }

    uuid: string = TutorialUniverseMapComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
