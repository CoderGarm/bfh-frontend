import {Component, OnInit} from '@angular/core';
import {TypeService} from "../../../../services/type.service";
import {OrbitalModule, PublicResourcesApiService} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../subscription.manager";
import {ChipSelectorValue, ChipSelectorValueResult} from "../../../shared-module/components/chip-selector/chip-selector.component";
import {MatChip} from "@angular/material/chips";

@Component({
    selector: 'app-library-orbital-module-display',
    templateUrl: './library-orbital-module-display.component.html',
    styleUrls: ['./library-orbital-module-display.component.scss']
})
export class LibraryOrbitalModuleDisplayComponent extends SubscriptionManager implements OnInit {

    private orbitalModules: OrbitalModule[] = [];
    filteredOrbitalModules: OrbitalModule[] = [];

    moduleChipValues: ChipSelectorValue[] = [];
    moduleResultingChips: ChipSelectorValueResult[] = [];

    resourceChipValues: ChipSelectorValue[] = [];
    resourceResultingChips: ChipSelectorValueResult[] = [];

    constructor(private publicResourcesApiService: PublicResourcesApiService,
                private typeService: TypeService) {
        super();

        let sub = this.typeService.eModuleTypes.subscribe(resp => {
            this.moduleChipValues = resp.map(type => <ChipSelectorValue>{
                value: type.typeName,
                trailingIcon: type
            });
        });
        this.subscriptions.push(sub);

        sub = this.typeService.eResourceTypes.subscribe(resp => {
            this.resourceChipValues = resp.map(type => <ChipSelectorValue>{
                value: type.typeName,
                trailingIcon: type
            });
        });
        this.subscriptions.push(sub);
    }

    ngOnInit() {
        let sub = this.publicResourcesApiService.getOrbitalModules().subscribe(resp => {
            this.orbitalModules = resp;
            this.filterDisplayedItems();
        });
        this.subscriptions.push(sub);
    }

    filterDisplayedItems() {

        const chips: ChipSelectorValueResult[] = [];
        chips.push(...this.resourceResultingChips);
        chips.push(...this.moduleResultingChips);

        const values = chips.filter(c => c.selected).map(c => c.chipValue);
        this.filteredOrbitalModules = this.orbitalModules.filter(o => values.includes(o.effect))
    }


    private getStringArrayFromMatChips(MatChipListbox: MatChip[] | MatChip): string[] {
        const selectedResourceTypes: string[] = [];
        if (MatChipListbox instanceof Array) {
            MatChipListbox.forEach(chip => selectedResourceTypes.push(chip.value));
        } else {
            selectedResourceTypes.push(MatChipListbox.value);
        }
        return selectedResourceTypes;
    }
}
