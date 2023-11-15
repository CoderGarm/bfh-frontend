import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EEducationType, EResourceType, HumanResourceAmount, ResourceAmount, TransportJob, WarShip} from "../../../services/swagger";
import {NestedTreeControl} from "@angular/cdk/tree";
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {TypeService} from "../../../services/type.service";


interface TreeNode {
    parent: Transports;
    children: TreeNode[];
}

interface Transports {
    to: string;
    transportJobs: What[];
}

interface Where {
    [key: string]: number;
}

interface What {
    resourceType?: EResourceType | EEducationType;
    total?: number;
    ships?: WarShip[];
    from: Where;
}

@Component({
    selector: 'app-transportation-list-display',
    templateUrl: './transportation-list-display.component.html',
    styleUrls: ['./transportation-list-display.component.scss']
})
export class TransportationListDisplayComponent implements AfterViewInit, OnChanges {

    treeControl = new NestedTreeControl<TreeNode>(node => node.children);
    dataSource = new MatTreeNestedDataSource<TreeNode>();

    @Input()
    transportJobs: TransportJob[] = [];

    constructor(private typeService: TypeService) {
        this.typeService.educationTypes;
        this.typeService.eResourceTypes;
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['transportJobs']) {
            const arr: TreeNode[] = [];
            const jobsByDestination: Map<string, TransportJob[]> = new Map<string, TransportJob[]>();
            this.transportJobs.forEach(t => {
                let transports = jobsByDestination.get(t.to.name!);
                if (!transports) {
                    transports = [];
                }
                transports.push(t);
                jobsByDestination.set(t.to.name!, transports);
            });

            jobsByDestination.forEach((jobs, to) => {
                const jobsByPayload: Map<string, What> = new Map<string, What>();
                jobs.forEach(transportJob => {
                    const from = transportJob.from.name!;
                    const resources: (ResourceAmount | HumanResourceAmount)[] = transportJob.resources;

                    resources.push(...transportJob.humanResources);
                    resources.forEach(r => {
                        let what = jobsByPayload.get(r.resourceType.typeName);
                        if (!what) {
                            what = {
                                from: {},
                                resourceType: r.resourceType,
                                total: 0
                            }
                        }
                        what.from[from] = r.amount;
                        what.total = (!!what.total ? what.total : 0) + r.amount;
                        jobsByPayload.set(r.resourceType.typeName, what);
                    });

                    transportJob.ships.forEach(w => {
                        let what = jobsByPayload.get(w.shipClass.name + w.shipClass.mark);
                        if (!what) {
                            what = {
                                from: {},
                                ships: []
                            }
                        }

                        what.ships?.push(w)
                        what.from[from] = 1;
                        jobsByPayload.set(w.shipClass.name + w.shipClass.mark, what);
                    });
                });

                let transports: Transports = {
                    to: to,
                    transportJobs: Array.from(jobsByPayload.values())
                }
                arr.push({
                    parent: transports,
                    children: []
                })
            });
            this.dataSource.data = arr;
            this.dataSource.data.forEach(node => this.treeControl.expandDescendants(node));
        }
    }
}
