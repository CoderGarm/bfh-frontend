import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {OrbitalModule, OrbitalStructures} from "../../../../../../services/swagger";

@Component({
    selector: 'app-structures-in-orbit',
    templateUrl: './structures-in-orbit.component.html',
    styleUrls: ['./structures-in-orbit.component.scss']
})
export class StructuresInOrbitComponent implements OnChanges {

    @Input()
    orbitalStructures: OrbitalStructures[] = [];

    orbitalStructureAmounts: Map<string, number> = new Map<string, number>();
    orbitalStructureTypes: Map<string, OrbitalModule> = new Map<string, OrbitalModule>();

    ngOnChanges(changes: SimpleChanges) {
        this.orbitalStructures.forEach((s: OrbitalStructures) => {
            const key = s.module.name;
            let count = this.orbitalStructureAmounts.has(key) ? this.orbitalStructureAmounts.get(key)! : 0;
            count++;
            this.orbitalStructureAmounts.set(key, count);
            this.orbitalStructureTypes.set(key, s.module);
        });
    }
}
