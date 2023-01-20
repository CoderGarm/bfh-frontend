import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AdminApiService, Translation} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {UntypedFormControl, UntypedFormGroup} from "@angular/forms";


@Component({
    selector: 'app-translation-editor',
    templateUrl: './translation-editor.component.html',
    styleUrls: ['./translation-editor.component.scss']
})
export class TranslationEditorComponent extends SubscriptionManager implements OnInit, OnChanges {

    static DEFAULT_LANGUAGE: string = 'en';

    @Input()
    possibleLanguages: string[] = [];

    @Input()
    translations: Translation[] = [];
    translationsDefinition: string = 'translations';

    /**
     * the translations from the backend to decide later which was changed by the user
     * languageCode:text
     */
    referenceTranslations: Map<string, Translation> = new Map<string, Translation>();

    /**
     * the english base translation direct from the backend's source code
     */
    referenceTranslation?: Translation;

    newTranslationFG: UntypedFormGroup = new UntypedFormGroup({
        selectedLanguageCode: new UntypedFormControl(''),
        translationFC: new UntypedFormControl('')
    });

    constructor(private adminApi: AdminApiService) {
        super();
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.translationsDefinition]) {
            this.setTranslations(this.translations);
        }
    }

    private setTranslations(input: Translation[]) {
        if (!input || input.length == 0) {
            this.referenceTranslation = undefined;
            return;
        }
        this.referenceTranslation = input.filter(tr => tr.languageCode == TranslationEditorComponent.DEFAULT_LANGUAGE)[0];
        this.translations = input.filter(tr => tr.languageCode != TranslationEditorComponent.DEFAULT_LANGUAGE);
        this.referenceTranslations.clear();
        this.translations.forEach(tr => this.referenceTranslations.set(tr.languageCode, {
            idTranslatable: tr.idTranslatable,
            languageCode: tr.languageCode,
            translation: tr.translation
        }));
    }

    getReducedLanguageCodes() {
        const result: string[] = [];
        let alreadyUsedLanguageCodes = this.translations.map(tr => tr.languageCode);
        alreadyUsedLanguageCodes.push(TranslationEditorComponent.DEFAULT_LANGUAGE);
        this.possibleLanguages.forEach(code => {
            if (!alreadyUsedLanguageCodes.includes(code)) {
                result.push(code);
            }
        });
        return result;
    }

    clear() {
        this.newTranslationFG.controls.translationFC.setValue('');
        this.newTranslationFG.controls.selectedLanguageCode.setValue(undefined);
    }

    submit(idTranslatable: number) {
        const currentTranslations: Map<string, Translation> = new Map<string, Translation>();
        this.translations.forEach(tr => currentTranslations.set(tr.languageCode, tr));
        const hasChanged: Translation[] = [];
        // detect changes in known translations
        currentTranslations.forEach((translation, languageCode) => {
            let reference = this.referenceTranslations.get(languageCode);
            if (!!reference && reference.translation != translation.translation) {
                hasChanged.push(translation);
            }
        });

        let newTranslation = this.newTranslationFG.controls.translationFC.value;
        let newLanguageCode = this.newTranslationFG.controls.selectedLanguageCode.value;
        if (!!newLanguageCode && !!newTranslation) {
            // set new translation if present
            const translated: Translation = {
                idTranslatable: idTranslatable,
                translation: newTranslation,
                languageCode: newLanguageCode
            }
            hasChanged.push(translated);
        }

        let sub = this.adminApi.updateTranslation(hasChanged).subscribe(resp => {
            this.setTranslations(resp);
        });
        this.subscriptions.push(sub);
        this.clear();
    }
}
