import {Injectable} from '@angular/core';
import {SubscriptionManager} from "../SubscriptionManager";
import {BuildingApiService, EEducationType, EHullType, EModuleType, ERefinementSequence, EResourceType, ResourcesApiService, ShipyardApiService} from "./swagger";

/**
 * Displays the spinner with or without a message.
 */
@Injectable()
export class TypeService extends SubscriptionManager {

    private _eModuleTypes: EModuleType[] = [];
    private _eHullTypes: EHullType[] = [];
    private _educationTypes: EEducationType[] = [];
    private _eResourceTypes: EResourceType[] = [];
    private _eProductionCategories: string[] = [];
    private _eRefinementSequences: ERefinementSequence[] = [];

    constructor(private shipyardApi: ShipyardApiService,
                private resourceApi: ResourcesApiService,
                private buildingApi: BuildingApiService) {
        super();

        let sub = shipyardApi.getEModuleTypes().subscribe(resp => this._eModuleTypes = resp);
        this.subscriptions.push(sub);

        sub = shipyardApi.getEHullTypes().subscribe(resp => this._eHullTypes = resp);
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

    get eHullTypes(): EHullType[] {
        return this._eHullTypes;
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
}
