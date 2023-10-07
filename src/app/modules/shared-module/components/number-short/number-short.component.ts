import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-number-short',
    templateUrl: './number-short.component.html',
    styleUrls: ['./number-short.component.scss']
})
export class NumberShortComponent implements OnInit {

    @Input()
    input?: number;

    @Input()
    suppressTooltip: boolean = false;

    // @formatter:off
    @Input()
    get colorSuccess() { return this._colorSuccess; }
    set colorSuccess(value: any) { this._colorSuccess = this.coerceBooleanProperty(value); }
    _colorSuccess: boolean = false;

    @Input()
    get colorRequired() { return this._colorRequired; }
    set colorRequired(value: any) { this._colorRequired = this.coerceBooleanProperty(value); }
    _colorRequired: boolean = false;

     @Input()
    get colorWarning() { return this._colorWarning; }
    set colorWarning(value: any) { this._colorWarning = this.coerceBooleanProperty(value); }
    _colorWarning: boolean = false;
    // @formatter:on

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }

    constructor() {
    }

    ngOnInit(): void {
    }

}
