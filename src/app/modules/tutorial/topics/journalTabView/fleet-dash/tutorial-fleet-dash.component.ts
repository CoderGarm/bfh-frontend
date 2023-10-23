import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";
import {EnumValueDto} from "../../../../../services/swagger";

@Component({
    selector: 'tut-fleet-dash',
    templateUrl: './tutorial-fleet-dash.component.html',
    styleUrls: ['./tutorial-fleet-dash.component.scss']
})
export class TutorialFleetDashComponent {

    public static TOPIC: Topic = {
        uuid: EnumValueDto.ETutorialCategoriesEnum.FLEET_DASH,
        title: 'Fleet Dashboard',
        subTitle: 'All about fleets'
    }

    uuid: string = TutorialFleetDashComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
