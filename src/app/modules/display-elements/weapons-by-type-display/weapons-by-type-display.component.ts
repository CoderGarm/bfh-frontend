import {Component, Input} from '@angular/core';
import {BaseModule, EnumValueDto, ShipClass, ShipClassMock} from "../../../services/swagger";
import {TypeService} from "../../../services/type.service";
import {CdkOverlayOrigin} from "@angular/cdk/overlay";
import EWeaponTypeEnum = EnumValueDto.EWeaponTypeEnum;
import EWeaponAlignmentEnum = EnumValueDto.EWeaponAlignmentEnum;

export interface Data {
    name: string;
    type: EWeaponTypeEnum;
    amount: number;
    shots?: number;
}

@Component({
    selector: 'app-weapons-by-type-display',
    templateUrl: './weapons-by-type-display.component.html',
    styleUrls: ['./weapons-by-type-display.component.scss']
})
export class WeaponsByTypeDisplayComponent<MODULE extends { baseModule: BaseModule }> {

    isOpen = false;
    triggerOrigin: any;
    weaponType?: EWeaponTypeEnum;

    @Input()
    shipClass?: ShipClass | ShipClassMock;

    @Input()
    alignmentType?: EWeaponAlignmentEnum;

    readonly weaponTypes: EWeaponTypeEnum[];

    constructor(private typeService: TypeService) {
        this.weaponTypes = this.typeService.weaponTypes;
    }

    toggle(weaponType: EWeaponTypeEnum, trigger: CdkOverlayOrigin) {
        this.triggerOrigin = trigger;
        this.isOpen = !this.isOpen
        if (this.isOpen) {
            this.weaponType = weaponType;
        } else {
            this.weaponType = undefined;
        }
    }

    getHoveredData(): Data[] {
        if (!this.shipClass || !this.weaponType) {
            return [];
        }
        const alignedFittings = this.shipClass.fittings
            .filter(al => !!this.alignmentType ? al.weaponAlignment === this.alignmentType : true)
            .filter(al => {
                if (!!al.launcher) {
                    return this.weaponType === al.launcher.weaponType;
                } else {
                    return this.weaponType === al.weapon!.weaponType;
                }
            });
        const result: Data[] = [];
        alignedFittings.forEach(af => {

            const baseModule = (!!af.launcher ? af.launcher : af.weapon)!;
            const shots: number = this.shipClass!.ammunitionFittings
                .filter(ammo => ammo.missile.baseModule.idModule === af.launcher?.allowedMissiles[0].baseModule.idModule) // fixme fix missile selection
                .map(ammo => ammo.amount)
                .reduce((sum, current) => sum + current, 0);

            result.push(({
                name: baseModule.baseModule.name,
                type: baseModule.weaponType,
                amount: af.amount,
                shots: (shots > 0 ? shots : undefined)
            }))
        })
        return result;
    }

    getAmount(type: EWeaponTypeEnum): number {
        if (!this.shipClass) {
            return 0;
        }
        const alignedFittings = this.shipClass.fittings
            .filter(al => !!this.alignmentType ? al.weaponAlignment === this.alignmentType : true)
            .filter(al => {
                if (!!al.launcher) {
                    return type === al.launcher.weaponType;
                } else {
                    return type === al.weapon!.weaponType;
                }
            });
        return alignedFittings.map(al => al.amount).reduce((sum, current) => sum + current, 0);
    }
}
