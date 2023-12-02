import {Component, Input} from '@angular/core';
import {PropertyHolder} from "../property-holder";
import {coerceBooleanProperty} from "@angular/cdk/coercion";

@Component({
    selector: 'app-properties-orbital-module',
    templateUrl: './properties-orbital-module.component.html',
    styleUrls: ['./properties-orbital-module.component.scss']
})
export class PropertiesOrbitalModuleComponent extends PropertyHolder {


    // @formatter:off
    @Input()
    get smallDisplay() { return this._smallDisplay; }
    set smallDisplay(value: any) { this._smallDisplay = coerceBooleanProperty(value); }
    _smallDisplay: boolean = false;
    // @formatter:on
}
