import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {EEducationType, EResourceType, HumanResourceAmount, ResourceAmount, ResourceDeposit} from "../../../services/swagger";
import {ResourceHelper} from "../../../services/helper/resource.helper";

@Component({
    selector: 'app-single-resource-transfer',
    templateUrl: './single-resource-transfer.component.html',
    styleUrls: ['./single-resource-transfer.component.scss']
})
export class SingleResourceTransferComponent implements OnInit, OnChanges {

    @Input()
    amount: number = 0;

    @Output()
    amountChange: EventEmitter<number> = new EventEmitter<number>();

    @Input()
    thumbLabel: boolean = false;

    @Input()
    disabled: boolean = false;

    @Input()
    resourceType?: EResourceType | EEducationType;

    @Input()
    leftDeposit?: ResourceDeposit;
    leftCopy?: ResourceDeposit;

    left: number = 0;
    leftPresent: number = 0;
    disabledLeft: boolean = false;

    @Input()
    limitLeft: number = 0;

    @Input()
    rightDeposit?: ResourceDeposit;
    rightCopy?: ResourceDeposit;

    right: number = 0;
    rightPresent: number = 0;
    disabledRight: boolean = false;

    stopLimitLastValue: number = 0;

    constructor() {
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['leftDeposit']) {
            this.left = this.getValue(this.leftDeposit);
            this.leftCopy = ResourceHelper.copy(this.leftDeposit);
            this.leftPresent = -this.getValue(this.leftDeposit);
        }
        if (changes['rightDeposit']) {
            this.right = this.getValue(this.rightDeposit);
            this.rightCopy = ResourceHelper.copy(this.rightDeposit);
            this.rightPresent = this.getValue(this.rightDeposit);
        }

        if (!this.amount) {
            this.amount = this.getStart();
        }
        this.detectDisable();
    }

    private detectDisable() {
        this.disabledLeft = this.limitLeft == 0 || this.right <= 0;
        this.disabledRight = this.left <= 0;
        if (this.disabledLeft || this.disabledRight) {
            this.stopLimitLastValue = this.amount;
        }
    }

    getStart() {
        if (!this.resourceType || !this.leftDeposit || !this.rightDeposit) {
            return 0;
        }

        let leftVal: number;
        let rightVal: number;
        if ('singularName' in this.resourceType) {
            leftVal = this.getResourceAmount(this.resourceType, this.leftDeposit);
            rightVal = this.getResourceAmount(this.resourceType, this.rightDeposit);
        } else {
            leftVal = this.getHumans(this.resourceType, this.leftDeposit);
            rightVal = this.getHumans(this.resourceType, this.rightDeposit);
        }
        return !leftVal ? rightVal : !rightVal ? -leftVal : 0;
    }

    getLink(resourceType: EResourceType | EEducationType): string {
        let folder = resourceType.folder;
        let iconName = resourceType.iconName;
        return "assets/" + folder + "/png16x/" + iconName + "_c.png";
    }

    private getResourceAmount(resource: EResourceType, deposit?: ResourceDeposit): number {
        if (!deposit) {
            return 0;
        }
        let resources: ResourceAmount[] | undefined = deposit.resources
            .filter(r => r.resourceType.typeName == resource.typeName);
        if (resources.length != 1) {
            return 0;
        }
        return resources[0].amount;
    }

    private getHumans(resource: EEducationType, deposit?: ResourceDeposit): number {
        if (!deposit) {
            return 0;
        }
        let resources: HumanResourceAmount[] | undefined = deposit.humanResources
            .filter(r => r.resourceType.typeName == resource.typeName);
        if (resources.length != 1) {
            return 0;
        }
        return resources[0].amount;
    }

    private getValue(deposit?: ResourceDeposit) {
        if (!this.resourceType) {
            return 0;
        }
        if ('singularName' in this.resourceType) {
            return this.getResourceAmount(this.resourceType, deposit);
        } else {
            return this.getHumans(this.resourceType, deposit);
        }
    }

    setAmount(amount: number) {
        if ((this.disabledLeft && amount < 0)) {
            // limit from right to left
            return;
        }

        if (this.left - amount < 0) {
            // limit from left to right
            amount = this.left;
        }

        this.left -= amount;
        this.right += amount;
        this.amountChange.emit(amount);
    }
}
