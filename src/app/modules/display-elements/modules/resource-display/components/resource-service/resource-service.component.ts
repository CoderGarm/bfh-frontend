import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {HumanResourceAmount, ResourceAmount, ResourceDeposit} from "../../../../../../services/swagger";
import {ResourceEmitterService} from "../../../../../../services/resource-emitter.service";
import {SubscriptionManager} from "../../../../../../subscription.manager";
import {MatDialog} from "@angular/material/dialog";
import {ResourceDisplayDialogComponent} from "../resource-display-dialog/resource-display-dialog.component";

@Component({
    selector: 'app-resource-service',
    templateUrl: './resource-service.component.html',
    styleUrls: ['./resource-service.component.scss']
})
export class ResourceServiceComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    deposit?: ResourceDeposit;
    private readonly _deposit = 'deposit';

    @Input()
    costs?: ResourceDeposit;
    private readonly _costs = 'costs';

    @Input()
    income?: ResourceDeposit;
    private readonly _income = 'income';

    @Input()
    capacity?: ResourceDeposit;
    private readonly _capacity = 'capacity';

    @Input()
    levelImprovementResources?: ResourceAmount;
    private readonly _levelImprovementResources = 'levelImprovementResources';

    @Input()
    levelImprovementHumanResources?: HumanResourceAmount;
    private readonly _levelImprovementHumanResources = 'levelImprovementHumanResources';

    constructor(private emitterService: ResourceEmitterService,
                private dialog: MatDialog) {
        super();
    }

    ngOnInit(): void {
    }

    openDialog(): void {
        this.emitterService.dialogRef = this.dialog.open(ResourceDisplayDialogComponent,
            {
                position: {
                    top: '0',
                    right: '0'
                },
                hasBackdrop: false,
                panelClass: ['resource-mat-dialog-panel', 'mat-elevation-z8']
            });
        let sub = this.emitterService.dialogRef.afterOpened().subscribe(() => this.emit());
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.open();

        if (changes[this._deposit]) {
            this.emitterService.deposit.emit(this.deposit);
        }

        if (changes[this._costs]) {
            this.emitterService.costs.emit(this.costs);
        }

        if (changes[this._income]) {
            this.emitterService.income.emit(this.income);
        }

        if (changes[this._capacity]) {
            this.emitterService.capacity.emit(this.capacity);
        }

        if (changes[this._levelImprovementResources]) {
            this.emitterService.levelImprovementHumanResources.emit(this.levelImprovementHumanResources);
        }

        if (changes[this._levelImprovementHumanResources]) {
            this.emitterService.levelImprovementHumanResources.emit(this.levelImprovementHumanResources);
        }
    }

    private emit() {
        this.emitterService.deposit.emit(this.deposit);
        this.emitterService.costs.emit(this.costs);
        this.emitterService.income.emit(this.income);
        this.emitterService.capacity.emit(this.capacity);
        this.emitterService.levelImprovementResources.emit(this.levelImprovementResources);
        this.emitterService.levelImprovementHumanResources.emit(this.levelImprovementHumanResources);
    }

    private open() {
        const isDataPresent = !!this.deposit || !!this.costs || !!this.income;
        if (!this.emitterService.dialogRef && isDataPresent) {
            this.openDialog();
        }
    }
}
