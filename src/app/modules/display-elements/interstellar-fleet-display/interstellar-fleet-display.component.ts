import {Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {Fleet} from "../../../services/swagger";

@Component({
    selector: 'app-interstellar-fleet-display',
    templateUrl: './interstellar-fleet-display.component.html',
    styleUrls: ['./interstellar-fleet-display.component.scss']
})
export class InterstellarFleetDisplayComponent implements OnInit {

    /**
     * the fleets to display
     */
    @Input()
    fleets: Fleet[] = [];

    constructor(@Optional() @Inject('fleets') fleets: Fleet[] | undefined) {
        if (!!fleets) {
            this.fleets = fleets;
        } else {
            this.fleets = [];
        }
    }

    ngOnInit(): void {
    }

}
