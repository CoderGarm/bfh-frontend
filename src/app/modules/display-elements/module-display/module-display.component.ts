import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {BaseModule, Propulsion} from "../../../services/swagger";

@Component({
    selector: 'app-module-display',
    templateUrl: './module-display.component.html',
    styleUrls: ['./module-display.component.scss']
})
export class ModuleDisplayComponent<MODULE extends { baseModule: BaseModule }> implements OnChanges {

    @Input()
    module?: MODULE;

    propulsion?: Propulsion;

    ngOnChanges(changes: SimpleChanges) {
        if (!!this.module) {
            if ('ftlCapable' in this.module) {
                this.propulsion = <Propulsion>this.module;
            }
        } else {
            this.propulsion = undefined;
        }
    }
}
