import {Component, OnInit} from '@angular/core';
import {TypeService} from "../../../../services/type.service";
import {EModuleType, OrbitalModule, PublicResourcesApiService} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../subscription.manager";
import {ChipSelectorValue, ChipSelectorValueResult} from "../../../shared-module/components/chip-selector/chip-selector.component";

@Component({
    selector: 'app-library-orbital-module-display',
    templateUrl: './library-orbital-module-display.component.html',
    styleUrls: ['./library-orbital-module-display.component.scss']
})
export class LibraryOrbitalModuleDisplayComponent extends SubscriptionManager implements OnInit {

    private moduleTypes: EModuleType[] = [];
    private orbitalModules: OrbitalModule[] = [];
    filteredOrbitalModules: OrbitalModule[] = [];

    chipValues: ChipSelectorValue[] = [];
    private chips: ChipSelectorValueResult[] = [];

    constructor(private publicResourcesApiService: PublicResourcesApiService,
                private typeService: TypeService) {
        super();

        let sub = this.typeService.eModuleTypes.subscribe(resp => {
            this.moduleTypes = resp;
            this.chipValues = resp.map(type => <ChipSelectorValue>{
                value: type.typeName,
                trailingIcon: type
            });
        });
        this.subscriptions.push(sub);
    }

    ngOnInit() {
        let sub = this.publicResourcesApiService.getOrbitalModules().subscribe(resp => {
            this.orbitalModules = resp;
            console.log(resp)
            this.filterDisplayedItems();
        });
        this.subscriptions.push(sub);
    }

    filterDisplayedItems(chips?: ChipSelectorValueResult[]) {
        if (!chips) {
            chips = this.chips;
        } else {
            this.chips = chips;
        }

        const values = chips.filter(c => c.selected).map(c => c.chipValue);
        this.filteredOrbitalModules = this.orbitalModules.filter(o => values.includes(o.moduleType.typeName))
    }
}
