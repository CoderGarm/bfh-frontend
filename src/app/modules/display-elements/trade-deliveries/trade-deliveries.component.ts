import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EnumValueDto, EResourceType, TradesByLocation} from "../../../services/swagger";
import {NestedTreeControl} from "@angular/cdk/tree";
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {TypeService} from "../../../services/type.service";
import {CurrentTickService} from "../../../services/intercom/current-tick.service";
import EResourceTypeEnum = EnumValueDto.EResourceTypeEnum;

interface TreeNode {
    parent: TradesByLocation;
    children: TreeNode[];
}

@Component({
    selector: 'app-trade-deliveries',
    templateUrl: './trade-deliveries.component.html',
    styleUrls: ['./trade-deliveries.component.scss']
})
export class TradeDeliveriesComponent implements AfterViewInit, OnChanges {

    @Input()
    trades: TradesByLocation[] = [];

    treeControl = new NestedTreeControl<TreeNode>(node => node.children);
    dataSource = new MatTreeNestedDataSource<TreeNode>();

    credits?: EResourceType;

    constructor(private typeService: TypeService,
                protected currentTickService: CurrentTickService) {
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['trades']) {
            const arr: TreeNode[] = [];
            this.trades.forEach(job => {
                arr.push({
                    parent: job,
                    children: []
                })
            })
            this.dataSource.data = arr;
            this.dataSource.data.forEach(node => this.treeControl.expandDescendants(node));
            // ask as late as possible for the prefetched resource types to avoid implementing it by a subject
            this.credits = this.typeService.collectableResourceTypes.filter(rt => rt.typeName === EResourceTypeEnum.CREDITS)[0];
        }
    }
}
