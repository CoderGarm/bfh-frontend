import {SubscriptionManager} from "../../../../../subscription.manager";

export class ScrollManager extends SubscriptionManager {

    private drawMethod?: () => void;

    mouseDown = false;

    startX: any;
    startY: any;

    scrollLeft: any;
    scrollTop: any;

    offsetX: number = 0;
    offsetY: number = 0;

    setDrawMethod(drawTree: () => void) {
        this.drawMethod = drawTree;
    }

    startDragging(e: MouseEvent, el: HTMLElement) {
        this.mouseDown = true;
        this.startX = e.pageX - el.offsetLeft;
        this.startY = e.pageY - el.offsetTop;
        this.scrollLeft = el.scrollLeft;
        this.scrollTop = el.scrollTop;
    }

    stopDragging(e: MouseEvent) {
        this.mouseDown = false;
    }

    moveEvent(e: MouseEvent, el: HTMLElement) {
        if (!this.mouseDown || !this.drawMethod) {
            return;
        }
        const x = e.pageX - el.offsetLeft;
        const scrollX = x - this.startX;
        this.offsetX = this.scrollLeft + scrollX;

        const y = e.pageY - el.offsetTop;
        const scrollY = y - this.startY;
        this.offsetY = this.scrollTop - scrollY;
        this.drawMethod();
    }
}
