import {Component} from '@angular/core';
import {EnumValueDto} from "../../../../services/swagger";
import EGameEventsEnum = EnumValueDto.EGameEventsEnum;

@Component({
    selector: 'app-player-points-tab-view',
    templateUrl: './player-points-tab-view.component.html',
    styleUrls: ['./player-points-tab-view.component.scss']
})
export class PlayerPointsTabViewComponent {

    static path: string = 'player';


    protected readonly EnumValueDto = EnumValueDto;
    protected readonly EGameEventsEnum = EGameEventsEnum;

    gameEvent?: EGameEventsEnum = undefined;

    setEvent(event?: EGameEventsEnum) {
        this.gameEvent = event;
    }

    isSelected(event?: EGameEventsEnum) {
        return this.gameEvent == event;
    }
}
