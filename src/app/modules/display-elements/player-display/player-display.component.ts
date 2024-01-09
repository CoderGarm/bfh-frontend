import {Component, Input} from '@angular/core';
import {Player} from "../../../services/swagger";
import {PlayerEmbassyService} from "../../../services/intercom/player-embassy.service";

@Component({
    selector: 'app-player-display',
    templateUrl: './player-display.component.html',
    styleUrls: ['./player-display.component.scss']
})
export class PlayerDisplayComponent {

    protected readonly PlayerEmbassyService = PlayerEmbassyService;

    @Input()
    player?: Player;

    constructor(protected embassyService: PlayerEmbassyService) {
    }

}
