import {Component, Input} from '@angular/core';
import {EnumValueDto, ShipClass, ShipClassMock} from "../../../services/swagger";
import {TypeService} from "../../../services/type.service";
import EWeaponTypeEnum = EnumValueDto.EWeaponTypeEnum;
import EWeaponAlignmentEnum = EnumValueDto.EWeaponAlignmentEnum;

@Component({
    selector: 'app-weapons-by-type-display',
    templateUrl: './weapons-by-type-display.component.html',
    styleUrls: ['./weapons-by-type-display.component.scss']
})
export class WeaponsByTypeDisplayComponent {

    @Input()
    shipClass?: ShipClass | ShipClassMock;

    @Input()
    alignmentType?: EWeaponAlignmentEnum;

    readonly weaponTypes: EWeaponTypeEnum[];

    constructor(private typeService: TypeService) {
        this.weaponTypes = this.typeService.weaponTypes;
    }

    getAmount(type: EWeaponTypeEnum): number {
        if (!this.shipClass) {
            return 0;
        }
        return this.shipClass.fittings
            .filter(al => !!this.alignmentType ? al.weaponAlignment === this.alignmentType : true)
            .filter(al => {
                if (!!al.launcher) {
                    return type == al.launcher.weaponType;
                } else {
                    return type == al.weapon!.weaponType;
                }
            }).length;
    }
}
