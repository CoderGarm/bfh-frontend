import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";
import {EnumValueDto} from "../../../../../services/swagger";

@Component({
  selector: 'tut-fleet-detachment',
  templateUrl: './tutorial-fleet-detachment.component.html',
  styleUrls: ['./tutorial-fleet-detachment.component.scss']
})
export class TutorialFleetDetachmentComponent {

  public static TOPIC: Topic = {
    uuid: EnumValueDto.ETutorialCategoriesEnum.FLEET_DETACHMENT,
    title: 'Detachments',
    subTitle: 'Fleet formations and mothballed ships'
  }

  uuid: string = TutorialFleetDetachmentComponent.TOPIC.uuid;

  constructor(protected scopeService: TutorialScopeService) {
  }
}
