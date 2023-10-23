import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";
import {EnumValueDto} from "../../../../../services/swagger";

@Component({
    selector: 'tut-trade-dash',
    templateUrl: './tutorial-trade-dash.component.html',
    styleUrls: ['./tutorial-trade-dash.component.scss']
})
export class TutorialTradeDashComponent {

    public static TOPIC: Topic = {
        uuid: EnumValueDto.ETutorialCategoriesEnum.TRADE_DASH,
        title: 'Trade Dashboard',
        subTitle: 'All about trading'
    }

    uuid: string = TutorialTradeDashComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
