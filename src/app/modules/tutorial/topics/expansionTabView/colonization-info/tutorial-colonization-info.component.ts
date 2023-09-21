import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";

@Component({
  selector: 'tut-colonization-info',
  templateUrl: './tutorial-colonization-info.component.html',
  styleUrls: ['./tutorial-colonization-info.component.scss']
})
export class TutorialColonizationInfoComponent {

  public static TOPIC: Topic = {
    uuid: 'tut-colo',
    title: 'Expansion',
    subTitle: 'How to colonize new planets'
  }

  uuid: string = TutorialColonizationInfoComponent.TOPIC.uuid;

  constructor(protected scopeService: TutorialScopeService) {
  }
}
