import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../../../tutorial-scope.service";
import {EnumValueDto} from "../../../../../services/swagger";

@Component({
    selector: 'tut-planetary-market',
    templateUrl: './tutorial-marketplace.component.html',
    styleUrls: ['./tutorial-marketplace.component.scss']
})
export class TutorialMarketplaceComponent {

    public static TOPIC: Topic = {
        uuid: EnumValueDto.ETutorialCategoriesEnum.MARKETPLACE,
        title: 'Planetary Marketplace',
        subTitle: 'Trading offers or at the spot market'
    }

    uuid: string = TutorialMarketplaceComponent.TOPIC.uuid;

    constructor(protected scopeService: TutorialScopeService) {
    }
}
