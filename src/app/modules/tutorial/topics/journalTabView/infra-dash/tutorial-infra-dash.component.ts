import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";
import {EnumValueDto} from "../../../../../services/swagger";

@Component({
    selector: 'tut-infra-dash',
    templateUrl: './tutorial-infra-dash.component.html',
    styleUrls: ['./tutorial-infra-dash.component.scss']
})
export class TutorialInfraDashComponent {

    public static TOPIC: Topic = {
        uuid: EnumValueDto.ETutorialCategoriesEnum.INFRA_DASH,
        title: 'Infrastructure Dashboard',
        subTitle: 'All about infrastructure'
    }

    uuid: string = TutorialInfraDashComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
