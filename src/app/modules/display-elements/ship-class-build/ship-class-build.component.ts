import {AfterViewInit, Component, Input} from '@angular/core';
import {ShipClass} from "../../../services/swagger";

@Component({
    selector: 'app-ship-class-build',
    templateUrl: './ship-class-build.component.html',
    styleUrls: ['./ship-class-build.component.scss']
})
export class ShipClassBuildComponent implements AfterViewInit {

    /**
     * the construction which should be displayed
     */
    @Input()
    shipClassInput!: ShipClass;

    constructor() {
    }

    ngAfterViewInit() {
    }
}
