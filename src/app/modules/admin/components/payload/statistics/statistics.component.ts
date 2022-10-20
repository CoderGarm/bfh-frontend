import {Component, OnInit} from '@angular/core';
import {AdminApiService, FileUpload} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent extends SubscriptionManager implements OnInit {

    constructor(private adminApi: AdminApiService) {
        super();
    }

    ngOnInit(): void {
    }

    downloadBuildings() {
        const sub = this.adminApi.getBuildings().subscribe(resp => this.downloadFile(resp));
        this.subscriptions.push(sub);
    }

    downloadModules() {
        const sub = this.adminApi.getModules().subscribe(resp => this.downloadFiles(resp));
        this.subscriptions.push(sub);
    }

    private downloadFiles(data: FileUpload[]) {
        data.forEach(d => this.downloadFile(d));
    }

    private downloadFile(data: FileUpload) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data.content));
        element.setAttribute('download', data.fileName);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}
