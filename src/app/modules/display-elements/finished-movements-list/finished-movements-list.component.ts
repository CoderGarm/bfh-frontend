import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FleetMovement} from "../../../services/swagger";
import {NestedTreeControl} from "@angular/cdk/tree";
import {MatTreeNestedDataSource} from "@angular/material/tree";

interface TreeNode {
    name: string;
    finishedMovement: FleetMovement;
    children: TreeNode[];
}

@Component({
    selector: 'app-finished-movements-list',
    templateUrl: './finished-movements-list.component.html',
    styleUrls: ['./finished-movements-list.component.scss']
})
export class FinishedMovementsListComponent implements AfterViewInit, OnChanges {

    treeControl = new NestedTreeControl<TreeNode>(node => node.children);
    dataSource = new MatTreeNestedDataSource<TreeNode>();

    @Input()
    finishedMovements: FleetMovement[] = [];

    constructor() {
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['finishedMovements']) {
            const arr: TreeNode[] = [];

            const map: Map<string, FleetMovement[]> = new Map<string, FleetMovement[]>();

            this.finishedMovements = this.finishedMovements.sort((a, b) => this.sortByAlertness(a, b));
            this.finishedMovements.forEach(m => {
                const key = this.getKey(m);
                let arr = map.get(key);
                if (!arr) {
                    arr = [];
                    map.set(key, arr);
                }
                arr.push(m);
            });

            map.forEach((value, key) => {
                const items = {
                    name: key,
                    finishedMovement: value[0],
                    children: value.map(f => {
                        const tn: TreeNode = {
                            name: this.getKey(f),
                            children: [],
                            finishedMovement: f
                        }
                        return tn;
                    })
                };
                arr.push(items);
            });
            this.dataSource.data = arr;
            this.dataSource.data.forEach(node => this.treeControl.expandDescendants(node));
        }
    }

    private sortByAlertness(a: FleetMovement, b: FleetMovement) {
        if (a.isForeignFleet && !b.isForeignFleet) {
            return -1;
        }
        if (!a.isForeignFleet && b.isForeignFleet) {
            return 1;
        }

        return a.isForeignFleet && b.isForeignFleet ? -1 : 1;
    }

    private getKey(m: FleetMovement) {
        let key: string = '';
        if (!m.destinationPlanet) {
            key += m.destinationSystem + ', Hyperlimit';
        } else {
            key += m.destinationPlanet + ', ' + m.destinationSystem;
            if (!!m.destinationPlanetOwner) {
                key += ', ' + m.destinationPlanetOwner;
            } else {
                key += ', uncolonized';
            }
        }
        return key;
    }
}
