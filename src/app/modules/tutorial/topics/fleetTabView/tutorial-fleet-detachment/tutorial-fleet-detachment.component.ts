import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";

@Component({
  selector: 'tut-fleet-detachment',
  templateUrl: './tutorial-fleet-detachment.component.html',
  styleUrls: ['./tutorial-fleet-detachment.component.scss']
})
export class TutorialFleetDetachmentComponent {

  public static TOPIC: Topic = {
    uuid: 'tut-fleet-detach',
    title: 'Detachments',
    subTitle: 'Fleet formations and mothballed ships'
  }

  uuid: string = TutorialFleetDetachmentComponent.TOPIC.uuid;

  constructor(protected scopeService: TutorialScopeService) {
  }
}
