import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EnumValueDto, HasIcon} from "../../../../services/swagger";
import {ResourceHelper} from "../../../../services/helper/resource.helper";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import EResourceTypeEnum = EnumValueDto.EResourceTypeEnum;

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
    set planet(value: any) { this._planet = coerceBooleanProperty(value); }
    _planet: boolean = false;

    @Input()
    get credits() { return this._credits; }
    set credits(value: any) { this._credits = coerceBooleanProperty(value); }
    _credits: boolean = false;

    @Input()
    get construction() { return this._construction; }
    set construction(value: any) { this._construction = coerceBooleanProperty(value); }
    _construction: boolean = false;

    @Input()
    get shipyard() { return this._shipyard; }
    set shipyard(value: any) { this._shipyard = coerceBooleanProperty(value); }
    _shipyard: boolean = false;

    @Input()
    get combat() { return this._combat; }
    set combat(value: any) { this._combat = coerceBooleanProperty(value); }
    _combat: boolean = false;

    @Input()
    get research() { return this._research; }
    set research(value: any) { this._research = coerceBooleanProperty(value); }
    _research: boolean = false;

    @Input()
    get png64px() { return this._png64px; }
    set png64px(value: any) { this._png64px = coerceBooleanProperty(value); }
    _png64px: boolean = false;

    @Input()
    get png32px() { return this._png32px; }
    set png32px(value: any) { this._png32px = coerceBooleanProperty(value); }
    _png32px: boolean = false;

    @Input()
    get png24px() { return this._png24px; }
    set png24px(value: any) { this._png24px = coerceBooleanProperty(value); }
    _png24px: boolean = false;

    @Input()
    get circleBorder() { return this._circleBorder; }
    set circleBorder(value: any) { this._circleBorder = coerceBooleanProperty(value); }
    _circleBorder: boolean = false;

    @Input()
    get hasUnread() { return this._hasUnread; }
    set hasUnread(value: any) { this._hasUnread = coerceBooleanProperty(value); }
    _hasUnread: boolean = false;

    @Input()
    get markRead() { return this._markRead; }
    set markRead(value: any) { this._markRead = coerceBooleanProperty(value); }
    _markRead: boolean = false;
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
        if (this._credits) {
            this.icon = ResourceHelper.getResourceType(EResourceTypeEnum.CREDITS);
        }
    }
}
