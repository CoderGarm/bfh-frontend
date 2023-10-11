import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {Research, ResearchLevel, ResearchResult, ResearchTree, ResearchTreeChain, ResearchTreeElement} from "../../../../../services/swagger";
import {ScrollManager} from "./scroll.manager";
import {Box} from "./box";
import {ConnectionPositionPair} from "@angular/cdk/overlay";
import {ResearchResultOverlayComponent} from "../research-result-overlay/research-result-overlay.component";
import {ColorSchemeService} from "../../../../../services/color-scheme.service";
import {BackgroundService} from "../../../../../services/prefetch/background.service";

export interface TreeElement {
    name: string;
    children: TreeElement[];
    depth: number;
    researchResult: ResearchResult[];
    unlocksAtLevel: number[];
    levelCompleted: number;
}

export interface BoxWithContext {
    box: Box,
    context: ResearchResult[]
}

@Component({
    selector: 'app-tech-tree',
    templateUrl: './tech-tree.component.html',
    styleUrls: ['./tech-tree.component.scss']
})
export class TechTreeComponent extends ScrollManager implements AfterViewInit {

    private static readonly WIDTH_PER_LEVEL: number = 100;
    private static readonly TEXT_COLOR: string = 'rgba(255, 255, 255, 0.7)';
    private static readonly BOUNDARY_COLOR: string = '#375a7f';
    private static readonly BOUNDARY_COLOR_DARK: string = '#383838';
    private elementBackgroundColor: string = 'rgb(66, 66, 66)';
    private researchDoneBackgroundColor: string = '#374f3d';

    private tree?: ResearchTree;
    private researchMap: Map<number, Research> = new Map<number, Research>();
    private completedResearches: ResearchLevel[] = [];

    @ViewChild('canvas', {static: true})
    canvas?: ElementRef<HTMLCanvasElement>;

    private ctx?: CanvasRenderingContext2D;
    private items: TreeElement[] = [];

    private unlockables: BoxWithContext[] = [];
    boxWithContext?: BoxWithContext;

    position: ConnectionPositionPair[] = [];

    @HostListener('window:resize', ['$event'])
    onResize(event?: any) {
        this.resizeCanvas();
        this.drawTree();
    }

    private resizeCanvas() {
        const canvas = document.querySelector('canvas');
        if (!!canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    constructor(private colorSchemeService: ColorSchemeService,
                private backgroundService: BackgroundService) {
        super();

        this.colorSchemeService.getSchemaEmitter().subscribe(schema => {
            switch (schema) {
                case 'dark':
                    this.elementBackgroundColor = 'rgb(66, 66, 66)';
                    this.researchDoneBackgroundColor = '#374f3d';
                    break;
                case 'light':
                    this.elementBackgroundColor = '#abb3ba';
                    this.researchDoneBackgroundColor = '#5e8c6a';
                    break;
            }
            this.drawTree();
        });

        this.setDrawMethod(this.drawTree);
    }

    ngAfterViewInit(): void {
        this.fetchData();
        this.ctx = this.canvas!.nativeElement.getContext('2d')!;
        this.fitToContainer();
    }

    private fetchData() {
        let sub = this.backgroundService.getResearchTree().subscribe(resp => {
            this.tree = resp;
            this.setTree();
        });
        this.subscriptions.push(sub);
        sub = this.backgroundService.getCompletedResearches().subscribe(resp => {
            this.completedResearches = resp;
            this.setTree();
        });
        this.subscriptions.push(sub);
    }

    handleMouseHover(e: MouseEvent) {
        if (this.isDragging || !this.ctx) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        const x = e.offsetX;
        const y = e.offsetY;

        const boxWithContexts = this.unlockables.filter(u => u.box.isInside(x, y));
        this.boxWithContext = boxWithContexts.length > 0 ? boxWithContexts[0] : undefined;
        if (!!this.boxWithContext) {
            this.position = ResearchResultOverlayComponent.getPosition(this.boxWithContext.box.x2, this.boxWithContext.box.y2);
        }
    }

    private fitToContainer() {
        const canvas = document.querySelector('canvas');
        if (!canvas) {
            return;
        }
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    private setTree() {
        if (!this.tree || this.completedResearches.length == 0) {
            return;
        }
        this.tree.researches.forEach(r => this.researchMap.set(r.idResearch, r));
        this.constructDisplayItems();
        this.drawTree();
    }

    private drawTree(drawCoordinateAxis: boolean = false) {
        const canvas = document.querySelector('canvas');
        if (!this.ctx || !canvas || !this.tree) {
            return;
        }

        // empty the canvas
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (drawCoordinateAxis) {
            this.displayCoordinateAxis(this.ctx);
        }

        this.unlockables = [];
        let currentParentsDepth = 0;
        const height = 50;
        for (let i = 1; i <= this.items.length; i++) {
            const parent = this.items[i - 1];
            const parentsDepth = this.calcDepth(parent);
            currentParentsDepth += parentsDepth;

            let currentChildDepth = 0;
            const parentsCountPositionModifier = height * currentParentsDepth;
            const parentsY = 10 + parentsCountPositionModifier;
            const parentsX = 10;
            const parentsBox = this.researchSwimLane(this.ctx, parentsX, parentsY, height, 10, parent);
            for (let j = 1; j <= parent.children.length; j++) {
                const child = (parent.children)[j - 1];
                const depthChildren = this.calcDepth(child);
                currentChildDepth += depthChildren;

                const childX = height * currentChildDepth;
                const childY = parentsY - childX;
                const childrenBox = this.researchSwimLane(this.ctx, childX, childY, height, 10, child);
                this.bezierCurveTo(this.ctx, parentsBox.getCenter().x, childrenBox.getCenter().x, parentsBox.y1, childrenBox.y2, TechTreeComponent.BOUNDARY_COLOR, 1);
            }
        }
    }

    private bezierCurveTo(ctx: CanvasRenderingContext2D, xFrom: number, xTo: number, yFrom: number, yTo: number, color: string, lineWidth: number) {

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(xFrom, yFrom);
        const cp1x: number = xFrom + 100;
        const cp1y: number = yFrom;
        const cp2x: number = xTo - 100;
        const cp2y: number = yTo;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, xTo, yTo);
        ctx.stroke();
        ctx.closePath();
    }

    private displayCoordinateAxis(ctx: CanvasRenderingContext2D) {

        const height = this.canvas!.nativeElement.height!;
        const width = this.canvas!.nativeElement.width!;

        const rows = height / 100;
        for (let i = 0; i < rows; i++) {
            const y = 100 * i;
            this.lineTo(ctx, 0, width, y, y, "green", 1)
        }

        const columns = width / 100;
        for (let i = 0; i < columns; i++) {
            const x = 100 * i;
            this.lineTo(ctx, x, x, 0, height, "green", 1)
        }
    }

    private constructDisplayItems() {
        if (!this.tree) {
            return;
        }
        const items: TreeElement[] = [];
        this.tree.researchTreeChains.forEach(chain => {
            const first = chain.treeElements.filter(e => !e.idUnlockedBy)[0];
            const research = this.researchMap.get(first.idResearch)!;
            const children = this.create(first, chain);
            const elem: TreeElement = {
                name: research.name,
                researchResult: first.unlocks,
                children: children,
                depth: children.length + 1,
                unlocksAtLevel: first.levels,
                levelCompleted: this.getCompletedLevel(research.idResearch)
            }
            items.push(elem);
        });
        this.items = items;
    }

    private lineTo(ctx: CanvasRenderingContext2D, xFrom: number, xTo: number, yFrom: number, yTo: number, color: string, lineWidth: number) {

        // adjust coordinates by mouse move
        xFrom += this.cameraOffset.x;
        yFrom -= this.cameraOffset.y;
        xTo += this.cameraOffset.x;
        yTo -= this.cameraOffset.y;

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(xFrom, yFrom);
        ctx.lineTo(xTo, yTo);
        ctx.stroke();
        ctx.closePath();
    }

    private calcDepth(e: TreeElement) {
        return 1 + e.depth + e.children.map(c => c.depth).reduce((sum, current) => sum + current, 0);
    }

    researchSwimLane(ctx: CanvasRenderingContext2D, x: number, y: number, height: number, radius: number, treeElement: TreeElement): Box {
        // adjust coordinates by mouse move
        x += this.cameraOffset.x;
        y -= this.cameraOffset.y;

        ctx.font = "20px Georgia";
        const textWidth = ctx.measureText(treeElement.name).width;
        let swimLaneWidth: number = textWidth + (treeElement.unlocksAtLevel.length * (TechTreeComponent.WIDTH_PER_LEVEL + radius)) + 3 * radius;
        const result = this.roundRect(ctx, x, y, swimLaneWidth, height, radius, TechTreeComponent.BOUNDARY_COLOR, this.elementBackgroundColor);
        this.drawUnlockingResearchLevels(ctx, treeElement, x, y, height, radius, textWidth);
        return result;
    }

    private drawUnlockingResearchLevels(ctx: CanvasRenderingContext2D, treeElement: TreeElement, x: number, y: number, height: number, radius: number, textWidth: number) {
        ctx.font = "20px Georgia";
        ctx.fillStyle = TechTreeComponent.TEXT_COLOR;
        ctx.textAlign = "start";
        ctx.textBaseline = "top";
        ctx.fillText(treeElement.name, x + radius, y + radius);
        const boxHeight = height / 2;
        y = y + boxHeight - radius / 2;
        x = x + textWidth + 3 * radius;
        for (let i = 0; i < treeElement.unlocksAtLevel.length; i++) {
            const level = treeElement.unlocksAtLevel[i];
            const researchResults = treeElement.researchResult.filter(u => u.unlockedByLevel === level);

            let boxX = x + (i * (radius + TechTreeComponent.WIDTH_PER_LEVEL));
            const fillColor = treeElement.levelCompleted >= level ? this.researchDoneBackgroundColor : this.elementBackgroundColor;
            this.roundRect(ctx, boxX, y, TechTreeComponent.WIDTH_PER_LEVEL, boxHeight, radius, TechTreeComponent.BOUNDARY_COLOR_DARK, fillColor);
            this.unlockables.push({
                box: new Box(boxX, y, TechTreeComponent.WIDTH_PER_LEVEL, boxHeight),
                context: researchResults
            });
            ctx.font = "20px Georgia";
            ctx.fillStyle = TechTreeComponent.TEXT_COLOR;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(level + '', boxX + (TechTreeComponent.WIDTH_PER_LEVEL / 2), y + (boxHeight / 2));
        }
    }

    private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, strokeColor: string, fillColor: string, fill: boolean = true): Box {
        ctx.lineWidth = 2;
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.stroke();
        if (fill) {
            ctx.fill();
        }
        return new Box(x, y, width, height);
    }

    private create(treeParent: ResearchTreeElement, chain: ResearchTreeChain): TreeElement[] {
        if (!treeParent.idUnlocks) {
            return [];
        }

        const unlockedTreeElement = chain.treeElements.filter(el => el.idResearch === treeParent.idUnlocks)[0];

        const research = this.researchMap.get(treeParent.idUnlocks)!;
        const children = this.create(unlockedTreeElement, chain);
        const elem: TreeElement = {
            name: research.name,
            researchResult: unlockedTreeElement.unlocks,
            children: children,
            depth: children.length + 1,
            unlocksAtLevel: unlockedTreeElement.levels,
            levelCompleted: this.getCompletedLevel(research.idResearch)
        }
        return [elem];
    }

    getCompletedLevel(idResearch: number): number {
        const researchLevels = this.completedResearches.filter(r => r.research.idResearch === idResearch);
        return researchLevels.length === 0 ? 0 : researchLevels[0].level;
    }
}
