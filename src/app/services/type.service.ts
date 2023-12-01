import {Injectable, NgZone} from '@angular/core';
import {SubscriptionManager} from "../subscription.manager";
import {EEducationType, EModuleType, EnumValueDto, ERefinementSequence, EResourceType, EShipClassType, PublicResourcesApiService} from "./swagger";
import {ReplaySubject} from "rxjs";
import EWeaponTypeEnum = EnumValueDto.EWeaponTypeEnum;
import EWeaponAlignmentEnum = EnumValueDto.EWeaponAlignmentEnum;
import EAlignmentTypeEnum = EnumValueDto.EAlignmentTypeEnum;
import EHyperBandsEnum = EnumValueDto.EHyperBandsEnum;

/**
 * Displays the spinner with or without a message.
 */
@Injectable()
export class TypeService extends SubscriptionManager {

    readonly eModuleTypes: ReplaySubject<EModuleType[]> = new ReplaySubject<EModuleType[]>();
    readonly shipClassTypes: ReplaySubject<EShipClassType[]> = new ReplaySubject<EShipClassType[]>();
    readonly educationTypes: ReplaySubject<EEducationType[]> = new ReplaySubject<EEducationType[]>();
    readonly eResourceTypes: ReplaySubject<EResourceType[]> = new ReplaySubject<EResourceType[]>();
    readonly eProductionCategories: ReplaySubject<string[]> = new ReplaySubject<string[]>();
    readonly eRefinementSequences: ReplaySubject<ERefinementSequence[]> = new ReplaySubject<ERefinementSequence[]>();

    readonly militaryEducationTypes: ReplaySubject<EEducationType[]> = new ReplaySubject<EEducationType[]>();
    readonly collectableResourceTypes: ReplaySubject<EResourceType[]> = new ReplaySubject<EResourceType[]>();

    readonly weaponTypes: EWeaponTypeEnum[] = [EWeaponTypeEnum.MISSILE, EWeaponTypeEnum.BEAM, EWeaponTypeEnum.COUNTER_MISSILE, EWeaponTypeEnum.POINT_DEFENSE];
    readonly weaponAlignmentTypes: EWeaponAlignmentEnum[] = [EWeaponAlignmentEnum.STERN, EWeaponAlignmentEnum.BROADSIDE, EWeaponAlignmentEnum.BOW];
    readonly alignmentAreas: EAlignmentTypeEnum[] = [EAlignmentTypeEnum.CHASEALIGNMENT, EAlignmentTypeEnum.BATTLEALIGNMENT];
    readonly hyperBands: EHyperBandsEnum[] = [
        EHyperBandsEnum.NONE,
        EHyperBandsEnum.ALPHA,
        EHyperBandsEnum.BETA,
        EHyperBandsEnum.GAMMA,
        EHyperBandsEnum.DELTA,
        EHyperBandsEnum.EPSILON,
        EHyperBandsEnum.ZETA,
        EHyperBandsEnum.ETA,
        EHyperBandsEnum.THETA
    ];

    constructor(private zone: NgZone,
                private publicResourcesApiService: PublicResourcesApiService) {
        super();

        let sub = this.educationTypes.subscribe(d =>
            this.militaryEducationTypes.next(d.filter(e => e.isMilitary)));
        this.subscriptions.push(sub);

        sub = this.eResourceTypes.subscribe(d =>
            this.collectableResourceTypes.next(d.filter(resourceType => resourceType.collectableType === EResourceType.CollectableTypeEnum.COLLECTABLE)));
        this.subscriptions.push(sub);

        this.fetchBaseData();
    }

    fetchBaseData() {
        this.zone.run(() => {
            let sub = this.publicResourcesApiService.getEModuleTypes().subscribe(resp => this.eModuleTypes.next(resp));
            this.subscriptions.push(sub);

            sub = this.publicResourcesApiService.getEEducationTypes().subscribe(resp => this.educationTypes.next(resp));
            this.subscriptions.push(sub);

            sub = this.publicResourcesApiService.getEResourceTypes().subscribe(resp => this.eResourceTypes.next(resp));
            this.subscriptions.push(sub);

            sub = this.publicResourcesApiService.getEProductionCategories().subscribe(resp => this.eProductionCategories.next(resp));
            this.subscriptions.push(sub);

            sub = this.publicResourcesApiService.getERefinementSequences().subscribe(resp => this.eRefinementSequences.next(resp));
            this.subscriptions.push(sub);

            sub = this.publicResourcesApiService.getEShipClassTypes().subscribe(resp => this.shipClassTypes.next(resp));
            this.subscriptions.push(sub);
        });
    }
}
