import {Injectable} from '@angular/core';
import {SubscriptionManager} from "../subscription.manager";
import {
    BuildingApiService,
    EEducationType,
    EModuleType,
    EnumValueDto,
    ERefinementSequence,
    EResourceType,
    EShipClassType,
    ResourcesApiService,
    ShipyardApiService
} from "./swagger";
import EWeaponTypeEnum = EnumValueDto.EWeaponTypeEnum;
import EWeaponAlignmentEnum = EnumValueDto.EWeaponAlignmentEnum;
import EAlignmentTypeEnum = EnumValueDto.EAlignmentTypeEnum;

/**
 * Displays the spinner with or without a message.
 */
@Injectable()
export class TypeService extends SubscriptionManager {
    get alignmentAreas(): EnumValueDto.EAlignmentTypeEnum[] {
        return this._alignmentAreas;
    }

    private _eModuleTypes: EModuleType[] = [];
    private _shipClassTypes: EShipClassType[] = [];
    private _educationTypes: EEducationType[] = [];
    private _eResourceTypes: EResourceType[] = [];
    private _eProductionCategories: string[] = [];
    private _eRefinementSequences: ERefinementSequence[] = [];

    private readonly _weaponTypes: EWeaponTypeEnum[] = [EWeaponTypeEnum.MISSILE, EWeaponTypeEnum.BEAM, EWeaponTypeEnum.COUNTERMISSILE, EWeaponTypeEnum.POINTDEFENSE];
    private readonly _weaponAlignmentTypes: EWeaponAlignmentEnum[] = [EWeaponAlignmentEnum.STERN, EWeaponAlignmentEnum.BROADSIDE, EWeaponAlignmentEnum.BOW];
    private readonly _alignmentAreas: EAlignmentTypeEnum[] = [EAlignmentTypeEnum.CHASEALIGNMENT, EAlignmentTypeEnum.BATTLEALIGNMENT];

    constructor(private shipyardApi: ShipyardApiService,
                private resourceApi: ResourcesApiService,
                private buildingApi: BuildingApiService) {
        super();

        let sub = shipyardApi.getEModuleTypes().subscribe(resp => this._eModuleTypes = resp);
        this.subscriptions.push(sub);

        sub = shipyardApi.getEShipClassTypes().subscribe(resp => this._shipClassTypes = resp);
        this.subscriptions.push(sub);

        sub = this.resourceApi.getEEducationTypes().subscribe(resp => this._educationTypes = resp);
        this.subscriptions.push(sub);

        sub = this.resourceApi.getEResourceTypes().subscribe(resp => this._eResourceTypes = resp);
        this.subscriptions.push(sub);

        sub = this.buildingApi.getEProductionCategories().subscribe(resp => this._eProductionCategories = resp);
        this.subscriptions.push(sub);

        sub = this.buildingApi.getERefinementSequences().subscribe(resp => this._eRefinementSequences = resp);
        this.subscriptions.push(sub);
    }


    get eModuleTypes(): EModuleType[] {
        return this._eModuleTypes;
    }

    get shipClassTypes(): EShipClassType[] {
        return this._shipClassTypes;
    }

    get educationTypes(): EEducationType[] {
        return this._educationTypes;
    }

    get militaryEducationTypes(): EEducationType[] {
        return this._educationTypes.filter(e => e.isMilitary);
    }

    get eResourceTypes(): EResourceType[] {
        return this._eResourceTypes;
    }

    get collectableResourceTypes(): EResourceType[] {
        return this._eResourceTypes.filter(resourceType => resourceType.collectableType === EResourceType.CollectableTypeEnum.COLLECTABLE);
    }

    get eProductionCategories(): string[] {
        return this._eProductionCategories;
    }

    get eRefinementSequences(): ERefinementSequence[] {
        return this._eRefinementSequences;
    }

    get weaponTypes(): EnumValueDto.EWeaponTypeEnum[] {
        return this._weaponTypes;
    }

    get weaponAlignmentTypes(): EnumValueDto.EWeaponAlignmentEnum[] {
        return this._weaponAlignmentTypes;
    }
}
