import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {HasIcon} from "../../../services/swagger";

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
    color: 'b' | 'w' | 'c' = 'c';

    // @formatter:off
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

    sizeComplement: string = 'png16x';
    backgroundColor: string = 'transparent';

    ngOnChanges(changes: SimpleChanges) {
        if (this.png64px) {
            this.sizeComplement = 'png64x';
        }
        if (this.png32px) {
            this.sizeComplement = 'png32x';
        }
        if (this.png24px) {
            this.sizeComplement = 'png24x';
        }

        switch (this.color) {
            case "b":
                this.backgroundColor = '#375a7f'//'whitesmoke';
                break;
            case "w":
                this.backgroundColor = 'black';
                break;
            case "c":
            default:
                break;
        }
    }

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }
}
