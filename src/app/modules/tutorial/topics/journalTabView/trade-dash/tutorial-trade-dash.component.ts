import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";

@Component({
    selector: 'tut-trade-dash',
    templateUrl: './tutorial-trade-dash.component.html',
    styleUrls: ['./tutorial-trade-dash.component.scss']
})
export class TutorialTradeDashComponent {

    public static TOPIC: Topic = {
        uuid: 'dash-trade-journal',
        title: 'Trade Dashboard',
        subTitle: 'All about trading'
    }

    uuid: string = TutorialTradeDashComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
