import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {Job, Planet} from "../../../../../services/swagger";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";


export interface PlanetaryJobs {
    idPlanet: number,
    name: string;
    construction?: Job,
    research?: Job,
    shipyard?: Job[],
    finishedConstruction?: Job,
    finishedResearch?: Job,
    finishedShipyard?: Job,
}

@Component({
    selector: 'app-job-overview',
    templateUrl: './job-overview.component.html',
    styleUrls: ['./job-overview.component.scss']
})
export class JobOverviewComponent implements OnChanges {

    dataSource: MatTableDataSource<PlanetaryJobs> = new MatTableDataSource<PlanetaryJobs>();

    @Input()
    finishedJobs: Job[] = [];

    @Input()
    finishedResearch?: Job;

    @Input()
    runningJobs: Job[] = [];

    @Input()
    runningResearch?: Job;

    @Input()
    planets: Planet[] = [];

    @ViewChild(MatPaginator)
    paginator?: MatPaginator;

    @ViewChild(MatSort, {static: false})
    sort?: MatSort;


    constructor() {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.rebuild();
    }

    private rebuild() {


        if (!!this.paginator) {
            this.dataSource.paginator = this.paginator;
        }
        if (!!this.sort) {
            this.dataSource.sort = this.sort;
        }
    }
}
