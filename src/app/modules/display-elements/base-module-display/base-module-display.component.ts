import {Component, Input} from '@angular/core';
import {BaseModule} from "../../../services/swagger";
import {coerceBooleanProperty} from "@angular/cdk/coercion";

@Component({
    selector: 'app-base-module-display',
    templateUrl: './base-module-display.component.html',
    styleUrls: ['./base-module-display.component.scss']
})
export class BaseModuleDisplayComponent<MODULE extends { baseModule: BaseModule }> {

    @Input()
    module?: MODULE;

    // @formatter:off
    @Input()
    get showIcon() { return this._showIcon; }
    set showIcon(value: any) { this._showIcon = coerceBooleanProperty(value); }
    _showIcon: boolean = false;
    // @formatter:on

}
