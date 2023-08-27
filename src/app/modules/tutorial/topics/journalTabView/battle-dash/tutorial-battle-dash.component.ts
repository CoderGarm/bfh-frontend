import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";

@Component({
    selector: 'tut-battle-dash',
    templateUrl: './tutorial-battle-dash.component.html',
    styleUrls: ['./tutorial-battle-dash.component.scss']
})
export class TutorialBattleDashComponent {

    public static TOPIC: Topic = {
        uuid: 'dash-battle-journal',
        title: 'Battle Report Dashboard',
        subTitle: 'All about reports'
    }

    uuid: string = TutorialBattleDashComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
