import {Component, OnInit, ViewChild} from '@angular/core';
import {SubscriptionManager} from "../../../../subscription.manager";
import {Building, EEducationType, ERefinementSequence, EResourceType, PublicResourcesApiService} from "../../../../services/swagger";
import {UntypedFormControl} from "@angular/forms";
import {MatChip, MatChipListbox} from "@angular/material/chips";
import {TypeService} from "../../../../services/type.service";

@Component({
    selector: 'app-library-building-display',
    templateUrl: './library-building-display.component.html',
    styleUrls: ['./library-building-display.component.scss']
})
export class LibraryBuildingDisplayComponent extends SubscriptionManager implements OnInit {

    buildings: Building[] = [];
    filteredBuildings: Building[] = [];

    building?: Building;

    eResourceTypes: EResourceType[] = [];
    eEducationTypes: EEducationType[] = [];
    eRefinementSequences: ERefinementSequence[] = [];
    eProductionCategories: string[] = [];

    eResourceTypeFC: UntypedFormControl = new UntypedFormControl({});
    eProductionCategoryFC: UntypedFormControl = new UntypedFormControl({});
    eRefinementSequenceFC: UntypedFormControl = new UntypedFormControl({});

    @ViewChild('resourceTypeChipList')
    resourceTypeChipList!: MatChipListbox;

    @ViewChild('productCategoryChipList')
    productCategoryChipList!: MatChipListbox;

    @ViewChild('refinementSequenceChipList')
    refinementSequenceChipList!: MatChipListbox;

    constructor(private publicResourcesApiService: PublicResourcesApiService,
                private typeService: TypeService) {
        super();

        this.eEducationTypes = this.typeService.educationTypes;
        this.eResourceTypes = this.typeService.eResourceTypes;
        this.eRefinementSequences = this.typeService.eRefinementSequences;
        this.eProductionCategories = this.typeService.eProductionCategories;

        this.eProductionCategoryFC.setValue(this.eProductionCategories);
        this.setResourceTypeFormControlData()
        this.setRefinementSequenceFormControlData()
    }

    ngOnInit() {
        let sub = this.publicResourcesApiService.getAllBuildings().subscribe(resp => {
            this.buildings = resp;
            this.filterDisplayedBuildings();
            this.building = this.buildings[0];
        });
        this.subscriptions.push(sub);
    }

    private setRefinementSequenceFormControlData() {
        let typeNames = this.eRefinementSequences.map(r => r.typeName);
        this.eRefinementSequenceFC.setValue(typeNames);
    }

    private setResourceTypeFormControlData() {
        let typeNames = this.eResourceTypes.map(r => r.typeName);
        this.eResourceTypeFC.setValue(typeNames);
    }

    toggle(event: string) {
        let chipList: MatChipListbox | undefined;
        if (event == 'resourceTypeChipList') {
            chipList = this.resourceTypeChipList;
        }
        if (event == 'productCategoryChipList') {
            chipList = this.productCategoryChipList;
        }
        if (event == 'refinementSequenceChipList') {
            chipList = this.refinementSequenceChipList;
        }
        if (!!chipList) {
            let selected = chipList._chips.filter(chip => chip.selected);
            let unselected = chipList._chips.filter(chip => !chip.selected);
            if (selected.length > unselected.length) {
                chipList._chips.forEach(chip => chip.deselect());
            } else {
                chipList._chips.forEach(chip => chip.select());
            }
            this.filterDisplayedBuildings();
        }
    }

    filterDisplayedBuildings() {
        const selectedResourceTypes: string[] = this.getStringArrayFromMatChips(this.resourceTypeChipList!.selected);
        const selectedProductCategories: string[] = this.getStringArrayFromMatChips(this.productCategoryChipList!.selected);
        const selectedRefinementSequence: string[] = this.getStringArrayFromMatChips(this.refinementSequenceChipList!.selected);

        this.filteredBuildings = this.buildings.filter(building => {
            const includesResourceType = selectedResourceTypes.includes(building.productionTarget.typeName);
            const includesCategory = selectedProductCategories.includes(building.productionCategory);
            let includesSequence = true;
            if (!!building.refinementSequence) {
                includesSequence = selectedRefinementSequence.includes(building.refinementSequence.typeName);
            }
            return includesResourceType && includesCategory && includesSequence;
        }).sort((a, b) => a.name.replace(' ', '') < b.name.replace(' ', '') ? -1 : 1);

        if (this.filteredBuildings.length === 0) {
            this.building = undefined;
        }
        if (this.filteredBuildings.length === 1) {
            this.building = this.filteredBuildings[0];
        }
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
