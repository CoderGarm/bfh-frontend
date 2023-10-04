import {AfterViewInit, Component} from '@angular/core';
import {EnumValueDto, RolePlayApiService} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";
import {TranslateService} from "@ngx-translate/core";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {FormControl, ValidationErrors} from "@angular/forms";
import {SingleTouchedFormFieldErrorStateMatcher} from "../../../validators/single-touched-form-field-error-state-matcher";
import {SnackbarNotificationService} from "../../../services/snackbar-notification.service";
import EStarNationsEnum = EnumValueDto.EStarNationsEnum;

@Component({
    selector: 'app-ship-name-templator',
    templateUrl: './ship-name-templator.component.html',
    styleUrls: ['./ship-name-templator.component.scss']
})
export class ShipNameTemplatorComponent extends SubscriptionManager implements AfterViewInit {

    prefixFC: FormControl<string | null> = this.getPrefixFC(undefined);

    matcher = new SingleTouchedFormFieldErrorStateMatcher();

    readonly nations: EStarNationsEnum[] = [
        EStarNationsEnum.MANTICORE,
        EStarNationsEnum.HAVEN,
        EStarNationsEnum.ANDERMAN,
        EStarNationsEnum.SILESIA,
        EStarNationsEnum.SOLARIAN_LEAGUE
    ];

    usersChosenTemplates: EStarNationsEnum[] = [];
    selectedNames: string[] = [];
    templatedNames: string[] = [];
    templateNames: Map<EStarNationsEnum, string[]> = new Map<EnumValueDto.EStarNationsEnum, string[]>();

    filteredTemplatedNames: string[] = [];
    filteredSelectedNames: string[] = [];

    filterValue: string = '';

    constructor(private rpgService: RolePlayApiService,
                private snackbar: SnackbarNotificationService,
                private translate: TranslateService) {
        super();

        this.translate.get('profile.navy.ship-name-template.nation.title.MANTICORE');
        this.translate.get('profile.navy.ship-name-template.nation.title.HAVEN');
        this.translate.get('profile.navy.ship-name-template.nation.title.ANDERMAN');
        this.translate.get('profile.navy.ship-name-template.nation.title.SILESIA');
        this.translate.get('profile.navy.ship-name-template.nation.title.SOLARIAN_LEAGUE');
    }

    deletePrefix() {
        let sub = this.rpgService.removeShipPrefix().subscribe(resp => {
            if (resp) {
                this.prefixFC = this.getPrefixFC('');
            }
        });
        this.subscriptions.push(sub);
    }

    ngAfterViewInit() {
        let sub = this.rpgService.getShipNameTemplates().subscribe(resp => {
            this.usersChosenTemplates = resp.shipNameTemplates;
            this.selectAllChosenTemplates();
        });
        this.subscriptions.push(sub);

        sub = this.rpgService.getShipNamesForUser().subscribe(resp => this.selectedNames = resp);
        this.subscriptions.push(sub);

        this.nations.forEach(value => {
            let sub = this.rpgService.getShipNamesFor(value).subscribe(resp => {
                this.templateNames.set(value, resp);
                this.selectAllChosenTemplates();
            });
            this.subscriptions.push(sub);
        });

        sub = this.rpgService.getShipPrefix().subscribe(resp => {
            if (resp.length == 1) {
                const prefix = resp[0];
                this.prefixFC = this.getPrefixFC(prefix);
            }
        });
        this.subscriptions.push(sub);
    }

    private getPrefixFC(prefix?: string) {
        prefix = !!prefix ? prefix : '';
        const formControl = new FormControl(prefix, [control => {
            const v: ValidationErrors = {};
            const isError = !!control && !!control.value ? (<string>control.value).length > 6 : false;
            if (isError) {
                v['too-long'] = '1';
            }
            return v;
        }]);

        let sub = formControl.valueChanges.subscribe(prefix => {
            if (!!prefix) {
                let sub = this.rpgService.setShipPrefix(prefix).subscribe(() => this.snackbar.notifySave());
                this.subscriptions.push(sub);
            } else {
                this.deletePrefix();
            }
        });
        this.subscriptions.push(sub);

        return formControl;
    }

    private selectAllChosenTemplates() {
        if (this.usersChosenTemplates.length > 0 && this.usersChosenTemplates.every(nation => this.templateNames.has(nation))) {
            this.usersChosenTemplates.forEach(nation => this.addTemplateNames(nation));
        }
    }

    addTemplateNames(event: EStarNationsEnum) {
        if (this.templateNames.has(event)) {
            this.templatedNames.push(...this.templateNames.get(event)!);
        }
        this.applyShipNameFilter();
    }

    removeTemplateNames(event: EStarNationsEnum) {
        if (this.templateNames.has(event)) {
            const names = this.templateNames.get(event)!;
            names.forEach(name => {
                const indexOf = this.templatedNames.indexOf(name);
                this.templatedNames.splice(indexOf, 1);
            });
        }
        this.applyShipNameFilter();
    }

    selectTemplate(event: MatCheckboxChange) {
        const checked = event.checked;
        const nation: EStarNationsEnum = event.source.value as keyof typeof EStarNationsEnum;
        if (checked) {
            this.addTemplateNames(nation);
            this.usersChosenTemplates.push(nation);
            this.addTemplate(nation);
        } else {
            this.removeTemplateNames(nation);
            const indexOf = this.usersChosenTemplates.indexOf(nation);
            this.usersChosenTemplates.splice(indexOf, 1);
            this.removeTemplate(nation);
        }
    }

    applyShipNameFilter() {
        this.filteredTemplatedNames = this.filterByValue(this.templatedNames);
        this.filteredSelectedNames = this.filterByValue(this.selectedNames);
    }

    private filterByValue(names: string[]) {
        if (this.filterValue.length == 0) {
            return names;
        }
        return names.filter(name => name.toLowerCase().includes(this.filterValue.toLowerCase()));
    }

    addIndividualName(name: string) {
        if (name.length > 0) {
            const alreadyPresent = this.selectedNames.filter(sn => sn.toLowerCase() === name.toLowerCase()).length > 0;
            if (!alreadyPresent) {
                this.selectedNames.push(name);
                this.applyShipNameFilter();
                this.addName(name);
            }
        }
    }

    removeIndividualName(name: string) {
        if (name.length > 0) {
            const indexOf = this.selectedNames.indexOf(name);
            this.selectedNames.splice(indexOf, 1);
            this.applyShipNameFilter();
            this.removeName(name);
        }
    }

    private addName(name: string) {
        let sub = this.rpgService.addShipNamesFor(name).subscribe(() => {
        });
        this.subscriptions.push(sub);
    }

    private removeName(name: string) {
        let sub = this.rpgService.removeShipNamesFor(name).subscribe(() => {
        });
        this.subscriptions.push(sub);
    }

    private addTemplate(template: EStarNationsEnum) {
        let sub = this.rpgService.addShipNameTemplate(template).subscribe(() => {
        });
        this.subscriptions.push(sub);
    }

    private removeTemplate(template: EStarNationsEnum) {
        let sub = this.rpgService.removeShipNameTemplate(template).subscribe(() => {
        });
        this.subscriptions.push(sub);
    }
}
