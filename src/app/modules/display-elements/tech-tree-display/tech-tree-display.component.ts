import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EResourceType, Research, ResearchApiService, ResearchLevel, ResearchTree, ResearchTreeElement} from "../../../services/swagger";
import {SubscriptionManager} from "../../../SubscriptionManager";
import {TypeService} from "../../../services/type.service";

@Component({
    selector: 'app-tech-tree-display',
    templateUrl: './tech-tree-display.component.html',
    styleUrls: ['./tech-tree-display.component.scss']
})
export class TechTreeDisplayComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    techTree?: ResearchTree;

    private idResearches: Int8Array = new Int8Array();
    basicResearches: Research[] = [];
    private researchesById = new Map<number, Research>();
    private researchTreeElementsById = new Map<number, ResearchTreeElement>();
    idResearchesByDepth: number[][] = [];
    maxDepth: number = 0;

    completedResearches: ResearchLevel[] = [];

    private readonly researchType: EResourceType;
    private readonly fallback: string;

    constructor(private researchApi: ResearchApiService,
                private typeService: TypeService) {
        super();

        this.researchType = this.typeService.eResourceTypes.filter(type => type.typeName == 'RESEARCH')[0];
        this.fallback = "assets/" + this.researchType.folder + "/png16x/" + this.researchType.iconName + "_c.png";
    }

    ngOnInit(): void {
        let sub = this.researchApi.getResearchByUser().subscribe(resp => this.completedResearches = resp);
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes["techTree"]) {
            if (!this.techTree) {
                this.basicResearches = [];
                this.researchesById.clear();
                this.researchTreeElementsById.clear();
                return;
            }

            this.techTree.researches.forEach(research => this.researchesById.set(research.idResearch, research));
            this.techTree.treeElements.forEach(treeElement => this.researchTreeElementsById.set(treeElement.idResearch, treeElement));

            let basicIdResearches = this.techTree.treeElements
                .filter(treeElement => !treeElement.idUnlockedBy)
                .map(treeElement => treeElement.idResearch);
            let sorted = Array.from(basicIdResearches).sort((a, b) => a - b);
            this.idResearches = new Int8Array(sorted);
            this.idResearches.forEach(idResearch => this.basicResearches.push(this.researchesById.get(idResearch)!));

            const re: number[] = [];
            this.basicResearches.forEach(r => re.push(r.idResearch));
            this.idResearchesByDepth.push(re);

            let unlockingIdResearches = this.techTree.treeElements
                .filter(treeElement => !!treeElement.idUnlocks)
                .map(treeElement => treeElement.idResearch);

            let techDepths: number[] = [];
            unlockingIdResearches.forEach(idResearch => {
                let depth = this.calcTechDepth(idResearch, 0);
                techDepths.push(depth);
            })
            sorted = Array.from(techDepths).sort((a, b) => a - b);
            let maxDepth = new Int8Array(sorted)[sorted.length - 1];

            let amountOfBasicResearches = this.basicResearches.length;
            for (let depthLevel = 0; depthLevel < maxDepth; depthLevel++) {
                let idResearchesOnDepth = this.idResearchesByDepth[depthLevel];
                const researchesOnDepth: number[] = [];
                for (let researchNo = 0; researchNo < amountOfBasicResearches; researchNo++) {
                    let idResearch = idResearchesOnDepth[researchNo];
                    if (!idResearch) {
                        researchesOnDepth.push(-1);
                    } else {
                        let treeElement = this.researchTreeElementsById.get(idResearch);
                        if (!treeElement) {
                            researchesOnDepth.push(-1);
                        } else {
                            let idUnlocks = treeElement.idUnlocks;
                            if (!idUnlocks) {
                                researchesOnDepth.push(-1);
                            } else {
                                researchesOnDepth.push(idUnlocks);
                            }
                        }
                    }
                }
                this.idResearchesByDepth[depthLevel + 1] = researchesOnDepth;
            }

            this.idResearchesByDepth = this.idResearchesByDepth[0].map((_, colIndex) => this.idResearchesByDepth.map(row => row[colIndex]));
            this.maxDepth = this.idResearchesByDepth[0].length;
        }
    }

    private calcTechDepth(idResearch: number, counter: number): number {
        let treeElement = this.researchTreeElementsById.get(idResearch)!;
        let idUnlocks = treeElement.idUnlocks;
        if (!!idUnlocks) {
            counter++;
            return this.calcTechDepth(idUnlocks, counter);
        }
        return counter;
    }

    getResearch(idResearch: number): Research | undefined {
        return this.researchesById.get(idResearch);
    }


    /**
     * constructs and returns the url to the icon
     */
    getLink(idResearch: number): string {
        let research = this.getResearch(idResearch);
        if (!research) {
            return this.fallback;
        }
        let hasIcon = research.hasIcon;
        if (!hasIcon) {
            return this.fallback;
        }
        let folder = hasIcon.folder;
        let iconName = hasIcon.iconName;
        return "assets/" + folder + "/png16x/" + iconName + "_c.png";
    }

    isCompleted(idResearch: number) {
        return this.completedResearches.filter(r => r.research.idResearch === idResearch).length > 0;
    }
}
