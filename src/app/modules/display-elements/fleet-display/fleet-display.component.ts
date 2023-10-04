import {Component, Input} from '@angular/core';
import {Fleet} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";

@Component({
    selector: 'app-fleet-display',
    templateUrl: './fleet-display.component.html',
    styleUrls: ['./fleet-display.component.scss']
})
export class FleetDisplayComponent extends SubscriptionManager {

    @Input()
    fleet?: Fleet;

    // @formatter:off

    @Input()
    get transparent() { return this._transparent; }
    set transparent(value: any) { this._transparent = this.coerceBooleanProperty(value); }
    _transparent: boolean = false;
    // @formatter:on

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }
}
