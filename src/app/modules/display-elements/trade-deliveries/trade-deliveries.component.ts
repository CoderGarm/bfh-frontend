import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EnumValueDto, EResourceType, TradesByLocation} from "../../../services/swagger";
import {NestedTreeControl} from "@angular/cdk/tree";
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {TypeService} from "../../../services/type.service";
import {CurrentTickService} from "../../../services/intercom/current-tick.service";
import {SubscriptionManager} from "../../../subscription.manager";
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
export class TradeDeliveriesComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    @Input()
    trades: TradesByLocation[] = [];

    treeControl = new NestedTreeControl<TreeNode>(node => node.children);
    dataSource = new MatTreeNestedDataSource<TreeNode>();

    credits?: EResourceType;

    constructor(private typeService: TypeService,
                protected currentTickService: CurrentTickService) {
        super();

        let sub = this.typeService.collectableResourceTypes.subscribe(d => {
            this.credits = d.filter(rt => rt.typeName === EResourceTypeEnum.CREDITS)[0];
        });
        this.subscriptions.push(sub);
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
        }
    }
}
