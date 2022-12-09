import {Component, Input, OnInit} from '@angular/core';
import {StateBlock} from "../../../services/swagger";

@Component({
    selector: 'app-spacecraft-state-block-display',
    templateUrl: './spacecraft-state-block-display.component.html',
    styleUrls: ['./spacecraft-state-block-display.component.scss']
})
export class SpacecraftStateBlockDisplayComponent implements OnInit {

    @Input()
    stateBlock?: StateBlock;

    @Input()
    isFleet: boolean = false;

    @Input()
    isWarship: boolean = false;

    constructor() {
    }

    ngOnInit(): void {
    }

    getSubject() {
        if (this.isFleet) {
            return 'spacecraft.state.title.fleet';
        }
        return 'spacecraft.state.title.warShip';
    }
}
