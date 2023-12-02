import {Component, Input} from '@angular/core';
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {EnumValueDto, HasIcon, OrbitalModule} from "../../../services/swagger";
import {ModuleHelper} from "../../../services/helper/moduleHelper";
import {ResourceHelper} from "../../../services/helper/resource.helper";
import EModuleTypesEnum = EnumValueDto.EModuleTypesEnum;
import EResourceTypeEnum = EnumValueDto.EResourceTypeEnum;

@Component({
    selector: 'app-orbital-module-display',
    templateUrl: './orbital-module-display.component.html',
    styleUrls: ['./orbital-module-display.component.scss']
})
export class OrbitalModuleDisplayComponent {

    @Input()
    module?: OrbitalModule;

    // @formatter:off
    @Input()
    get showIcon() { return this._showIcon; }
    set showIcon(value: any) { this._showIcon = coerceBooleanProperty(value); }
    _showIcon: boolean = false;

    @Input()
    get libraryMode() { return this._libraryMode; }
    set libraryMode(value: any) { this._libraryMode = coerceBooleanProperty(value); }
    _libraryMode: boolean = false;

    @Input()
    get resourceMode() { return this._resourceMode; }
    set resourceMode(value: any) { this._resourceMode = coerceBooleanProperty(value); }
    _resourceMode: boolean = false;

    @Input()
    get smallDisplay() { return this._smallDisplay; }
    set smallDisplay(value: any) { this._smallDisplay = coerceBooleanProperty(value); }
    _smallDisplay: boolean = false;
    // @formatter:on

    getIcon(): HasIcon | undefined {
        if (!this.module) {
            return undefined;
        }

        if (this.module.effect == EModuleTypesEnum.ELECTRONIC_WARFARE) {
            return ModuleHelper.getModuleType(this.module.effect);
        }

        if (this.module.effect == EResourceTypeEnum.POPULATION) {
            return ResourceHelper.getResourceType(this.module.effect);
        }

        return undefined;
    }
}
