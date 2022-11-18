import {Component, OnInit} from '@angular/core';
import {AdminApiService, Translation, WikiApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-translation',
    templateUrl: './translation.component.html',
    styleUrls: ['./translation.component.scss']
})
export class TranslationComponent extends SubscriptionManager implements OnInit {

    possibleLanguages: string[] = [];
    translations: Translation[] = [];
    translationsByTranslatable: Map<number, Translation[]> = new Map<number, Translation[]>();

    constructor(private adminApi: AdminApiService,
                private wikiApi: WikiApiService) {
        super();
    }

    ngOnInit(): void {
        this.wikiApi.getPossibleLanguages().subscribe(resp => this.possibleLanguages = resp);
        this.adminApi.getTranslations().subscribe(resp => {
            this.translations = resp;
            this.translationsByTranslatable.clear();
            this.translations.forEach(tr => {
                let valueMap = this.translationsByTranslatable.get(tr.idTranslatable);
                if (!valueMap) {
                    valueMap = [];
                    this.translationsByTranslatable.set(tr.idTranslatable, valueMap);
                }
                valueMap.push(tr);
            });
        });
    }

    getDescription(value: Translation[]) {
        if (!value || value.length == 0) {
            return "";
        }
        let translation = value[0];
        return "For ID: " + translation.idParent + " from type: " + translation.translationTarget + " for translation of: " + translation.translatableType;
    }
}
