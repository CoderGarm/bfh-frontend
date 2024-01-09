import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Player} from "../../../services/swagger";
import {PlayerEmbassyService} from "../../../services/intercom/player-embassy.service";
import {coerceBooleanProperty} from "@angular/cdk/coercion";

@Component({
    selector: 'app-player-display',
    templateUrl: './player-display.component.html',
    styleUrls: ['./player-display.component.scss']
})
export class PlayerDisplayComponent implements OnChanges {

    protected readonly PlayerEmbassyService = PlayerEmbassyService;

    @Input()
    player?: Player;

    //@formatter:off
    @Input()
    get png64px() { return this._png64px; }
    set png64px(value: any) { this._png64px = coerceBooleanProperty(value); }
    _png64px: boolean = false;

    @Input()
    get png24px() { return this._png24px; }
    set png24px(value: any) { this._png24px = coerceBooleanProperty(value); }
    _png24px: boolean = false;

    @Input()
    get png16px() { return this._png16px; }
    set png16px(value: any) { this._png16px = coerceBooleanProperty(value); }
    _png16px: boolean = false;
    //@formatter:on

    sizeComplement: string = '32px';

    constructor(protected embassyService: PlayerEmbassyService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.png64px) {
            this.sizeComplement = '64px';
        }
        if (this.png24px) {
            this.sizeComplement = '24px';
        }
        if (this._png16px) {
            this.sizeComplement = '16px';
        }
    }

}
