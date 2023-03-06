import {Component, Input} from '@angular/core';
import {BaseModule} from "../../../services/swagger";

@Component({
    selector: 'app-module-display',
    templateUrl: './module-display.component.html',
    styleUrls: ['./module-display.component.scss']
})
export class ModuleDisplayComponent<MODULE extends { baseModule: BaseModule }> {

    @Input()
    module?: MODULE;

}
