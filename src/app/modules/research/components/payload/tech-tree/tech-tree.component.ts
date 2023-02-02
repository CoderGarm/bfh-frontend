import {Component, OnInit} from '@angular/core';
import {ResearchApiService, ResearchTree} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-tech-tree',
    templateUrl: './tech-tree.component.html',
    styleUrls: ['./tech-tree.component.scss']
})
export class TechTreeComponent extends SubscriptionManager implements OnInit {

    tree?: ResearchTree;

    constructor(private researchApi: ResearchApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.researchApi.getTree().subscribe(resp => this.tree = resp);
        this.subscriptions.push(sub);
    }

    mouseDown = false;

    startX: any;
    startY: any;

    scrollLeft: any;
    scrollTop: any;

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
        e.preventDefault();
        if (!this.mouseDown) {
            return;
        }
        const x = e.pageX - el.offsetLeft;
        const scrollX = x - this.startX;
        el.scrollLeft = this.scrollLeft - scrollX;

        const y = e.pageY - el.offsetTop;
        const scrollY = y - this.startY;
        el.scrollTop = this.scrollTop - scrollY;
    }
}
