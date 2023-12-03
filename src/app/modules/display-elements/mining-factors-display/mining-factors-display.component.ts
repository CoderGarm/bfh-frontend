import {Component, Inject, Input, OnChanges, Optional, SimpleChanges} from '@angular/core';
import {SubscriptionManager} from "../../../subscription.manager";
import {EResourceType, MiningFactors, ResourceAmount} from "../../../services/swagger";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-mining-factors-display',
    templateUrl: './mining-factors-display.component.html',
    styleUrls: ['./mining-factors-display.component.scss']
})
export class MiningFactorsDisplayComponent extends SubscriptionManager implements OnChanges {

    @Input()
    miningFactors?: MiningFactors;

    @Input()
    miningFactorModifications: ResourceAmount[] = [];
    modifications: Map<string, string> = new Map<string, string>();

    translations: Map<string, string> = new Map<string, string>();

    private readonly construction = 'mining-factor.tooltip.construction';
    private readonly orbitalConstruction = 'mining-factor.tooltip.orbital_construction';
    private readonly research = 'mining-factor.tooltip.research';
    private readonly credits = 'mining-factor.tooltip.credits';
    private readonly metalore = 'mining-factor.tooltip.metalore';
    private readonly rareElements = 'mining-factor.tooltip.rare_elements';
    private readonly heavyMetals = 'mining-factor.tooltip.heavy_metals';
    private readonly population = 'mining-factor.tooltip.population';

    constructor(@Optional() @Inject('miningFactors') miningFactors: MiningFactors,
                public translate: TranslateService) {
        super();
        this.miningFactors = miningFactors;

        this.translations.set(this.construction, this.construction);
        this.translate.get('mining-factor.tooltip.construction').subscribe((translated: string) => {
            this.translations.set(this.construction, translated);
        });

        this.translations.set(this.orbitalConstruction, this.orbitalConstruction);
        this.translate.get('mining-factor.tooltip.orbital_construction').subscribe((translated: string) => {
            this.translations.set(this.orbitalConstruction, translated);
        });

        this.translations.set(this.research, this.research);
        this.translate.get('mining-factor.tooltip.research').subscribe((translated: string) => {
            this.translations.set(this.research, translated);
        });

        this.translations.set(this.credits, this.credits);
        this.translate.get('mining-factor.tooltip.credits').subscribe((translated: string) => {
            this.translations.set(this.credits, translated);
        });

        this.translations.set(this.metalore, this.metalore);
        this.translate.get('mining-factor.tooltip.metalore').subscribe((translated: string) => {
            this.translations.set(this.metalore, translated);
        });

        this.translations.set(this.rareElements, this.rareElements);
        this.translate.get('mining-factor.tooltip.rare_elements').subscribe((translated: string) => {
            this.translations.set(this.rareElements, translated);
        });

        this.translations.set(this.heavyMetals, this.heavyMetals);
        this.translate.get('mining-factor.tooltip.heavy_metals').subscribe((translated: string) => {
            this.translations.set(this.heavyMetals, translated);
        });

        this.translations.set(this.population, this.population);
        this.translate.get('mining-factor.tooltip.population').subscribe((translated: string) => {
            this.translations.set(this.population, translated);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        this.modifications.clear();
        this.miningFactorModifications.forEach(r => this.modifications.set(r.resourceType.typeName, r.amount + ''));
    }

    getTooltip(resourceType: EResourceType) {
        let key = 'mining-factor.tooltip.' + resourceType.typeName.toLowerCase();
        let translation = this.translations.get(key);
        if (!translation) {
            return "";
        }
        return translation;
    }
}
