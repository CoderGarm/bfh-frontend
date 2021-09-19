import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Construction, Planet} from "../../../../services/swagger";
import {MatTabGroup} from "@angular/material/tabs";

@Component({
    selector: 'app-planet-main',
    templateUrl: './planet-main.component.html',
    styleUrls: ['./planet-main.component.scss']
})
export class PlanetMainComponent implements OnInit {

    actionTabTitles: string[] = ['Dashboard', 'Constructions', 'Shipyard', 'Jobs']

    @ViewChild((MatTabGroup))
    matTabGroup?: MatTabGroup;

    constructions: Construction[] = [];

    /**
     * The user selected planet.
     */
    @Input()
    selectedPlanetInput?: Planet;

    constructor() {
    }

    ngOnInit(): void {
    }
}
