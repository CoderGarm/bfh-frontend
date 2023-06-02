import {SubscriptionManager} from "../../../../../subscription.manager";

export class ScrollManager extends SubscriptionManager {

    private drawMethod?: () => void;

    isDragging: boolean = false;

    cameraOffset: { x: number, y: number } = {x: 0, y: 0};
    dragStart: { x: number, y: number } = {x: 0, y: 0};

    /**
     * flips the y-axis because upside-down computer logic
     */
    getEventLocation(e: MouseEvent): { x: number, y: number } {
        return {x: e.clientX, y: -e.clientY}
    }

    setDrawMethod(drawTree: () => void): void {
        this.drawMethod = drawTree;
    }

    startDragging(e: MouseEvent): void {
        this.isDragging = true;
        this.dragStart.x = this.getEventLocation(e).x - this.cameraOffset.x;
        this.dragStart.y = this.getEventLocation(e).y - this.cameraOffset.y;
    }

    stopDragging(): void {
        this.isDragging = false;
    }

    handleMouseDragMove(e: MouseEvent): void {
        if (!this.isDragging || !this.drawMethod) {
            return;
        }

        this.cameraOffset.x = this.getEventLocation(e).x - this.dragStart.x;
        this.cameraOffset.y = this.getEventLocation(e).y - this.dragStart.y;
        this.drawMethod();
    }
}
