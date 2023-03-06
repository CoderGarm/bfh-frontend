import {Component, Input} from '@angular/core';
import {Propulsion} from "../../services/swagger";

@Component({
    selector: 'app-propulsion-display',
    templateUrl: './propulsion-display.component.html',
    styleUrls: ['./propulsion-display.component.scss']
})
export class PropulsionDisplayComponent {

    @Input()
    module?: Propulsion;

}
