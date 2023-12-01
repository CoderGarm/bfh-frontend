import {Component, Input} from '@angular/core';
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {PropertyDescriptor} from "../../../services/swagger";

@Component({
    selector: 'app-property-descriptor-display',
    templateUrl: './property-descriptor-display.component.html',
    styleUrls: ['./property-descriptor-display.component.scss']
})
export class PropertyDescriptorDisplayComponent {

    @Input()
    propertyDescriptor?: PropertyDescriptor;

    // @formatter:off
    @Input()
    get showIcon() { return this._showIcon; }
    set showIcon(value: any) { this._showIcon = coerceBooleanProperty(value); }
    _showIcon: boolean = false;
    // @formatter:on

}
