import {EventEmitter, Injectable} from "@angular/core";
import {HumanResourceAmount, ResourceAmount, ResourceDeposit} from "./swagger";
import {SubscriptionManager} from "../subscription.manager";
import {MatDialogRef} from "@angular/material/dialog";
import {ResourceDisplayDialogComponent} from "../modules/display-elements/modules/resource-display/components/resource-display-dialog/resource-display-dialog.component";
import {Point} from "@angular/cdk/drag-drop";

/**
 * Shovels data into the resource display component.
 */
@Injectable()
export class ResourceEmitterService extends SubscriptionManager {

    dialogRef?: MatDialogRef<ResourceDisplayDialogComponent>;

    dialogPosition: Point = {
        x: 0,
        y: 0
    };

    close: EventEmitter<boolean> = new EventEmitter<boolean>();

    deposit: EventEmitter<ResourceDeposit> = new EventEmitter<ResourceDeposit>();

    costs: EventEmitter<ResourceDeposit> = new EventEmitter<ResourceDeposit>();

    income: EventEmitter<ResourceDeposit> = new EventEmitter<ResourceDeposit>();

    capacity: EventEmitter<ResourceDeposit> = new EventEmitter<ResourceDeposit>();

    levelImprovementResources: EventEmitter<ResourceAmount> = new EventEmitter<ResourceAmount>();

    levelImprovementHumanResources: EventEmitter<HumanResourceAmount> = new EventEmitter<HumanResourceAmount>();

    constructor() {
        super();
    }

    closeDialog() {
        this.close.emit(true);
        this.clear();
    }

    clear() {
        if (!this.dialogRef) {
            return;
        }
        this.deposit.emit(undefined);
        this.costs.emit(undefined);
        this.income.emit(undefined);
        this.capacity.emit(undefined);
        this.levelImprovementResources.emit(undefined);
        this.levelImprovementHumanResources.emit(undefined);
    }

    saveDragEnd(point: Point) {
        this.dialogPosition = point;
    }
}
