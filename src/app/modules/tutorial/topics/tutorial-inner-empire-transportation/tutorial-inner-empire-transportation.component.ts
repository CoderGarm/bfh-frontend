import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../tutorial-scope.service";

@Component({
    selector: 'tut-inner-empire-transportation',
    templateUrl: './tutorial-inner-empire-transportation.component.html',
    styleUrls: ['./tutorial-inner-empire-transportation.component.scss']
})
export class TutorialInnerEmpireTransportationComponent {

    public static TOPIC: Topic = {
        uuid: 'inner-empire-carrier',
        title: 'Delivery Services',
        subTitle: 'Transports within the empire'
    }

    uuid: string = TutorialInnerEmpireTransportationComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
