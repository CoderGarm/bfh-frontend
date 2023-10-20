import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {StateBlock} from "../../../services/swagger";

@Component({
    selector: 'app-spacecraft-state-block-display',
    templateUrl: './spacecraft-state-block-display.component.html',
    styleUrls: ['./spacecraft-state-block-display.component.scss']
})
export class SpacecraftStateBlockDisplayComponent implements OnChanges {

    @Input()
    stateBlock?: StateBlock;

    @Input()
    isFleet: boolean = false;

    @Input()
    isWarship: boolean = false;

    prefix: string = '';

    ngOnChanges(changes: SimpleChanges) {
        this.getSubject();
    }


    getSubject() {
        if (this.isFleet) {
            this.prefix = 'spacecraft.state.title.fleet';
        } else {
            this.prefix = 'spacecraft.state.title.warShip';
        }
    }
}
