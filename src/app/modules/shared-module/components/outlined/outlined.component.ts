import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-outlined',
    templateUrl: './outlined.component.html',
    styleUrls: ['./outlined.component.scss']
})
export class OutlinedComponent {

    @Input()
    titleValue: string = '';

    // @formatter:off
    @Input()
    get fitContent() { return this._fitContent; }
    set fitContent(value: any) { this._fitContent = this.coerceBooleanProperty(value); }
    _fitContent: boolean = false;
    // @formatter:on

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }
}
