import {Component, Input} from "@angular/core";
import {PropertyDescriptor} from "../../../../services/swagger";

@Component({
    template: ''
})
export class PropertyHolder {

    @Input()
    propertyDescriptor?: PropertyDescriptor;
}
