import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ResourceEmitterService} from "../../../../../../services/resource-emitter.service";
import {SubscriptionManager} from "../../../../../../SubscriptionManager";
import {CdkDragEnd, Point} from "@angular/cdk/drag-drop";

@Component({
    selector: 'app-resource-display-dialog',
    templateUrl: './resource-display-dialog.component.html',
    styleUrls: ['./resource-display-dialog.component.scss']
})
export class ResourceDisplayDialogComponent extends SubscriptionManager implements OnInit {

    dialogPosition: Point;

    constructor(public dialogRef: MatDialogRef<ResourceDisplayDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: MatDialogConfig,
                private emitterService: ResourceEmitterService) {
        super();

        let sub = this.emitterService.close.subscribe(resp => {
            if (resp) {
                this.close();
            }
        });
        this.subscriptions.push(sub);
        this.dialogPosition = this.emitterService.dialogPosition;
    }

    close(): void {
        this.dialogRef.close(true);
        this.emitterService.dialogRef = undefined;
    }

    ngOnInit(): void {
    }

    dragEnd(event: CdkDragEnd) {
        const boxes: HTMLCollectionOf<Element> = document.getElementsByClassName("resource-mat-dialog-panel");
        const box = boxes.item(0)
        const offsetY = !box ? 0 : box.clientWidth;
        this.emitterService.saveDragEnd({
            x: event.dropPoint.x - offsetY,
            y: event.dropPoint.y
        });
    }
}
