import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";
import {EnumValueDto} from "../../../../../services/swagger";

@Component({
    selector: 'tut-job-dash',
    templateUrl: './tutorial-job-dash.component.html',
    styleUrls: ['./tutorial-job-dash.component.scss']
})
export class TutorialJobDashComponent {

    public static TOPIC: Topic = {
        uuid: EnumValueDto.ETutorialCategoriesEnum.JOB_DASH,
        title: 'Job Dashboard',
        subTitle: 'All about jobs'
    }

    uuid: string = TutorialJobDashComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
