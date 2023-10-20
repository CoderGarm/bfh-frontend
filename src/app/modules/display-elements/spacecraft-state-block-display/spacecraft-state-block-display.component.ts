import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {StateBlock} from "../../../services/swagger";
import {coerceBooleanProperty} from "@angular/cdk/coercion";

@Component({
    selector: 'app-spacecraft-state-block-display',
    templateUrl: './spacecraft-state-block-display.component.html',
    styleUrls: ['./spacecraft-state-block-display.component.scss']
})
export class SpacecraftStateBlockDisplayComponent implements OnChanges {

    @Input()
    stateBlock?: StateBlock;

    // @formatter:off
    @Input()
    get isFleet() { return this._isFleet; }
    set isFleet(value: any) { this._isFleet = coerceBooleanProperty(value); }
    _isFleet: boolean = false;

    @Input()
    get isWarship() { return this._isWarship; }
    set isWarship(value: any) { this._isWarship = coerceBooleanProperty(value); }
    _isWarship: boolean = false;

    @Input()
    get minified() { return this._minified; }
    set minified(value: any) { this._minified = coerceBooleanProperty(value); }
    _minified: boolean = false;
    // @formatter:on

    prefix: string = '';

    ngOnChanges(changes: SimpleChanges) {
        this.getSubject();
    }


    getSubject() {
        if (this._isFleet) {
            this.prefix = 'spacecraft.state.title.fleet';
        } else {
            this.prefix = 'spacecraft.state.title.warShip';
        }
    }
}
