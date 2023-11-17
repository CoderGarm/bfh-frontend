import {Component, Input} from '@angular/core';
import {Propulsion} from "../../../services/swagger";
import {coerceBooleanProperty} from "@angular/cdk/coercion";

@Component({
    selector: 'app-propulsion-module-display',
    templateUrl: './propulsion-module-display.component.html',
    styleUrls: ['./propulsion-module-display.component.scss']
})
export class PropulsionModuleDisplayComponent {

    @Input()
    module?: Propulsion;

    // @formatter:off
    @Input()
    get showIcon() { return this._showIcon; }
    set showIcon(value: any) { this._showIcon = coerceBooleanProperty(value); }
    _showIcon: boolean = false;
    // @formatter:on

}
