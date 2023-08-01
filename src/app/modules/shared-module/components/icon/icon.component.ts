import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {HasIcon} from "../../../../services/swagger";

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnChanges {

    @Input()
    icon?: HasIcon;

    @Input()
    altText: string = '';

    @Input()
    toolTip: string = '';

    @Input()
    fleetSize?: number;

    fleetIcon?: string;

    // @formatter:off
    @Input()
    get planet() { return this._planet; }
    set planet(value: any) { this._planet = this.coerceBooleanProperty(value); }
    _planet: boolean = false;

    @Input()
    get png64px() { return this._png64px; }
    set png64px(value: any) { this._png64px = this.coerceBooleanProperty(value); }
    _png64px: boolean = false;

    @Input()
    get png32px() { return this._png32px; }
    set png32px(value: any) { this._png32px = this.coerceBooleanProperty(value); }
    _png32px: boolean = false;

    @Input()
    get png24px() { return this._png24px; }
    set png24px(value: any) { this._png24px = this.coerceBooleanProperty(value); }
    _png24px: boolean = false;

    @Input()
    get circleBorder() { return this._circleBorder; }
    set circleBorder(value: any) { this._circleBorder = this.coerceBooleanProperty(value); }
    _circleBorder: boolean = false;
    // @formatter:on

    sizeComplement: string = '16px';

    ngOnChanges(changes: SimpleChanges) {
        if (this.png64px) {
            this.sizeComplement = '64px';
        }
        if (this.png32px) {
            this.sizeComplement = '32px';
        }
        if (this.png24px) {
            this.sizeComplement = '24px';
        }
        this.fleetIcon = !this.fleetSize ? undefined : this.fleetSize <= 5 ? 'rank-1' : this.fleetSize <= 15 ? 'rank-2' : 'rank-3';
    }

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }
}
