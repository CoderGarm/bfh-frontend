import {Component, Input} from '@angular/core';
import {EnumValueDto, ShipClass, ShipClassMock} from "../../../services/swagger";
import {TypeService} from "../../../services/type.service";
import EWeaponAlignmentEnum = EnumValueDto.EWeaponAlignmentEnum;

@Component({
    selector: 'app-weapon-amount-by-alignment-display',
    templateUrl: './weapon-amount-by-alignment-display.component.html',
    styleUrls: ['./weapon-amount-by-alignment-display.component.scss']
})
export class WeaponAmountByAlignmentDisplayComponent {

    @Input()
    shipClass?: ShipClass | ShipClassMock;

    weaponAlignmentTypes: EWeaponAlignmentEnum[];

    constructor(private typeService: TypeService) {
        this.weaponAlignmentTypes = this.typeService.weaponAlignmentTypes;
    }
}
