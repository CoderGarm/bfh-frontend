import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Commissioning} from "../../../services/swagger";
import {NestedTreeControl} from "@angular/cdk/tree";
import {MatTreeNestedDataSource} from "@angular/material/tree";


interface TreeNode {
    parent: Commissioning;
    children: TreeNode[];
}

@Component({
    selector: 'app-commissioned-operationals',
    templateUrl: './commissioned-operationals.component.html',
    styleUrls: ['./commissioned-operationals.component.scss']
})
export class CommissionedOperationalsComponent implements OnInit, OnChanges {

    @Input()
    title_key: string = 'finished';

    treeControl = new NestedTreeControl<TreeNode>(node => node.children);
    dataSource = new MatTreeNestedDataSource<TreeNode>();

    @Input()
    commissionedOperationals: Commissioning[] = [];

    constructor() {
    }

    ngOnInit(): void {
    }


    ngOnChanges(changes: SimpleChanges): void {
        if (changes['commissionedOperationals']) {
            const arr: TreeNode[] = [];
            this.commissionedOperationals.forEach(job => {
                arr.push({
                    parent: job,
                    children: []
                })
            })
            this.dataSource.data = arr;
            this.dataSource.data.forEach(node => this.treeControl.expandDescendants(node));
        }
    }
}
