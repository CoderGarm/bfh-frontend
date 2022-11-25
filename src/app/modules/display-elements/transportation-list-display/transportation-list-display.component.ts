import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {HumanResourceAmount, ResourceAmount, TransportJob} from "../../../services/swagger";
import {NestedTreeControl} from "@angular/cdk/tree";
import {MatTreeNestedDataSource} from "@angular/material/tree";


interface TreeNode {
    parent: TransportJob;
    children: TreeNode[];
}


@Component({
    selector: 'app-transportation-list-display',
    templateUrl: './transportation-list-display.component.html',
    styleUrls: ['./transportation-list-display.component.scss']
})
export class TransportationListDisplayComponent implements AfterViewInit, OnChanges {

    treeControl = new NestedTreeControl<TreeNode>(node => node.children);
    dataSource = new MatTreeNestedDataSource<TreeNode>();

    @Input()
    transportJobs: TransportJob[] = [];

    constructor() {
    }

    ngAfterViewInit(): void {
    }

    getLink(cap: ResourceAmount | HumanResourceAmount): string {
        let folder = cap.resourceType.folder;
        let iconName = cap.resourceType.iconName;
        return "assets/" + folder + "/png16x/" + iconName + "_c.png";
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['transportJobs']) {
            const arr: TreeNode[] = [];
            this.transportJobs.forEach(job => {
                arr.push({
                    parent: job,
                    children: []
                })
            })
            this.dataSource.data = arr;
        }
    }
}
