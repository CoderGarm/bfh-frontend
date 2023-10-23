import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";
import {EnumValueDto} from "../../../../../services/swagger";

@Component({
  selector: 'tut-mission',
  templateUrl: './tutorial-mission.component.html',
  styleUrls: ['./tutorial-mission.component.scss']
})
export class TutorialMissionComponent {

  public static TOPIC: Topic = {
    uuid: EnumValueDto.ETutorialCategoriesEnum.MISSION,
    title: 'Strategic Objectives',
    subTitle: 'How to use missions'
  }

  uuid: string = TutorialMissionComponent.TOPIC.uuid;

  constructor(protected scopeService: TutorialScopeService) {
  }
}
