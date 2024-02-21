import {EnumValueDto} from "../swagger";
import EShipClassTypeEnum = EnumValueDto.EShipClassTypeEnum;

export enum EAssetType {
    MODULES = 'modules',
    SHIPS = 'ships',
}

export enum EAssetTypeSegment {
    AMM = 'amm',
    AMS = 'ams',
    PD = 'pd',
    LAC = 'lac',
    VT = 'vt',
    FG = 'fg',
    DD = 'dd',
    CL = 'cl',
    CA = 'ca',
    BC = 'bc',
    BCP = 'bcp',
    BB = 'bb',
    DN = 'dn',
    CLAC = 'clac',
    SD = 'sd',
    SDP = 'sdp',
    AE = 'ae',
    AR = 'ar',
    FAT = 'fat',
    FR = 'fr',
    Q = 'q',
}

export class AssetHelper {

    private static KEY_TO_PATH: Map<string, string[]> = new Map<string, string[]>();
    static {
        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.MODULES, EAssetTypeSegment.AMM), [
            'cmlauncherandmagazine_017a_by_maxxqbunine_d72r5ug-fullview.jpg',
            'family_portrait_001_by_maxxqbunine_d7pa2e6-pre.jpg',
            'family_portrait_002_by_maxxqbunine_d7pa2hh-fullview.jpg',
            'mk9_screenshot_001_by_maxxqbunine_d7pa2mt-fullview.jpg',
            'mk9_screenshot_002_by_maxxqbunine_d7pa2oe-fullview.jpg',
            'mk9_screenshot_003_by_maxxqbunine_d7pa2ru-fullview.jpg',
            'mk21cm_010_by_maxxqbunine_d7pa3av-fullview.jpg',
            'mk21cm_011_by_maxxqbunine_d7pa3cy-fullview.jpg',
            'mk30cm_001_by_maxxqbunine_d7pa3hw-fullview.jpg',
            'mk30cm_002_by_maxxqbunine_d7pa3k8-fullview.jpg',
        ]);

        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.MODULES, EAssetTypeSegment.AMS), [
            'cm_and_viper_family_portrait_001_by_maxxqbunine_d7pa1uf-pre.jpg',
            'cm_and_viper_family_portrait_002_by_maxxqbunine_d7pa278-pre.jpg',
            'mk13asm_v2_001_by_maxxqbunine_d7pa2yc-fullview.jpg',
            'mk13asm_v2_002_by_maxxqbunine_d7pa304-fullview.jpg',
            'mk16cutawayoverall_by_maxxqbunine_d7pa36i-fullview.jpg',
            'mk16ddmv2_006_by_maxxqbunine_d7pa38h-fullview.jpg',
            'mk23_v2_003_by_maxxqbunine_d7pa3eo-fullview.jpg',
            'mk23_v2_005_by_maxxqbunine_d7pa3gf-fullview.jpg',
            'rotary_missile_magazine_012_by_maxxqbunine_d7pa31w-fullview.jpg',
            'rotary_missile_magazine_017_by_maxxqbunine_d7pa34h-fullview.jpg',
        ]);

        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.MODULES, EAssetTypeSegment.PD), [
            'pdlc_001a_by_maxxqbunine_d72r66a-fullview.jpg',
        ]);

        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.SHIPS, EAssetTypeSegment.BC), [
            'BC_Mendelssohn_5.jpg',
            'HMS_Nike_BC-413.png',
            'Homer_class_BC_01.webp',
            'Mendelssohn_Class_02.jpg',
            'Nike_Klasse.jpg',
            'nikeclassbcwithkeyhole1_001_by_maxxqbunine_d8121ex-fullview.jpg',
            'nikeclassbcwithkeyhole1_002_by_maxxqbunine_d8121ez-fullview.jpg',
            'nikeclassbcwithkeyhole1_003_by_maxxqbunine_d8121f1-fullview.jpg',
            'nikeclassbcwithkeyhole1_004_by_maxxqbunine_d8121f2-fullview.jpg',
            'nikeclassbcwithkeyhole1_005_by_maxxqbunine_d8121f3-fullview.jpg',
            'Redoubtable_class_01.png',
            'reliantclassbc_001_by_maxxqbunine_d8120sh-fullview.jpg',
            'reliantclassbc_002_by_maxxqbunine_d8120si-fullview.jpg',
            'reliantclassbc_003_by_maxxqbunine_d8120sl-fullview.jpg',
            'reliantclassbc_004_by_maxxqbunine_d8120ss-fullview.jpg',
            'Silesia_class_01.webp',
            'Sultan_class_BC.webp',
        ]);

        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.SHIPS, EAssetTypeSegment.BCP), [
            'agamemnonclassbc_p_001_by_maxxqbunine_d81217w-fullview.jpg',
            'agamemnonclassbc_p_002_by_maxxqbunine_d812180-fullview.jpg',
            'agamemnonclassbc_p_003_by_maxxqbunine_d812181-fullview.jpg',
            'agamemnonclassbc_p_004_by_maxxqbunine_d812182-fullview.jpg',
        ]);

        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.SHIPS, EAssetTypeSegment.CA), [
            'Broadsword_class.png',
            'Crusader_class_01.png',
            'heavycruisergroup_001_by_maxxqbunine_d7v2tbk-fullview.jpg',
            'heavycruisergroup_002_by_maxxqbunine_d7v2tbr-fullview.jpg',
            'saganami_c_class_ca_001_by_maxxqbunine_d7v2s5b-fullview.jpg',
            'saganami_c_class_ca_002_by_maxxqbunine_d7v2s5f-fullview.jpg',
            'Starknightclass_001_by_maxxqbunine.webp',
            'starknightclassca_001_by_maxxqbunine_d7v2t6a-fullview.jpg',
            'starknightclassca_002_by_maxxqbunine_d7v2t6g-fullview.jpg',
            'Warriorclassca_003_by_maxxqbunine.webp',
            'warriorclassca_003_by_maxxqbunine_d7v2scg-fullview.jpg',
            'warriorclassca_004_by_maxxqbunine_d7v2scj-fullview.jpg',
        ]);

        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.SHIPS, EAssetTypeSegment.CL), [
            'Apollo_class.png',
            'avalonclasscl_003_by_maxxqbunine_d7tq6ta-fullview.jpg',
            'avalonclasscl_004_by_maxxqbunine_d7tq6ti-fullview.jpg',
            'Casey_Class.webp',
            'Courageous_Class.jpg',
            'Courageous_class_in_space.png',
            'courageousclasscl_005_by_maxxqbunine_d7tq6db-fullview.jpg',
            'courageousclasscl_006_by_maxxqbunine_d7tq6df-fullview.jpg',
            'Illustrious_class.png',
            'lightcruiserswithstarknightheavycruiser_006_by_maxxqbunine_d7tq73q-fullview.jpg',
            'Nachtschatten_Klasse.png',
            'valiantclasscl_003_by_maxxqbunine_d7tq6xt-fullview.jpg',
            'valiantclasscl_004_by_maxxqbunine_d7tq6xx-fullview.jpg',
        ]);

        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.SHIPS, EAssetTypeSegment.CLAC), [
            'Minotaur.jpg',
        ]);

        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.SHIPS, EAssetTypeSegment.DD), [
            'Bastogne_class_DD.webp',
            'Chanson_class_in_space_02.png',
            'chansondd_001_by_maxxqbunine_d7sl2g9-fullview.jpg',
            'chansondd_002_by_maxxqbunine_d7sl2gc-fullview.jpg',
            'chansondd_003_by_maxxqbunine_d7sl2gg-fullview.jpg',
            'chansondd_004_by_maxxqbunine_d7sl2gk-fullview.jpg',
            'chansondd_005_by_maxxqbunine_d7sl2gn-fullview.jpg',
            'Culverin-DD.webp',
            'Falcon_class_in_space.png',
            'falcondd_001_by_maxxqbunine_d7sl22k-fullview.jpg',
            'falcondd_002_by_maxxqbunine_d7sl22o-fullview.jpg',
            'falcondd_003_by_maxxqbunine_d7sl22r-fullview.jpg',
            'falcondd_004_by_maxxqbunine_d7sl22u-fullview.jpg',
            'group_001_by_maxxqbunine_d7sl2t0-fullview.jpg',
            'group_002_by_maxxqbunine_d7sl2t4-fullview.jpg',
            'Havoc_class_1.png',
            'rolandclassdd_001_by_maxxqbunine_d7sl2mf-fullview.jpg',
            'rolandclassdd_002_by_maxxqbunine_d7sl2mh-fullview.jpg',
            'rolandclassdd_003_by_maxxqbunine_d7sl2mn-fullview.jpg',
            'rolandclassdd_004_by_maxxqbunine_d7sl2mp-fullview.jpg',
        ]);

        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.SHIPS, EAssetTypeSegment.DN), [
            'Majestic_Class_DN_01.png',
        ]);

        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.SHIPS, EAssetTypeSegment.LAC), [
            '9bb4dd7ca983122439d53d24be421081.jpg',
            'Highlander_class_LAC_02.png',
        ]);

        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.SHIPS, EAssetTypeSegment.Q), [
            'Wayfarer.webp',
        ]);

        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.SHIPS, EAssetTypeSegment.SD), [
            'King_William_class_SD.png',
        ]);

        this.KEY_TO_PATH.set(AssetHelper.getKey(EAssetType.SHIPS, EAssetTypeSegment.VT), [
            'Gryf.webp',
        ]);

    }

    private static getSubstitute(segment: EAssetTypeSegment) {
        switch (segment) {
            case EAssetTypeSegment.AMM:
            case EAssetTypeSegment.AMS:
            case EAssetTypeSegment.PD:
            case EAssetTypeSegment.LAC:
            case EAssetTypeSegment.VT:
            case EAssetTypeSegment.DD:
            case EAssetTypeSegment.CL:
            case EAssetTypeSegment.CA:
            case EAssetTypeSegment.BC:
            case EAssetTypeSegment.BCP:
            case EAssetTypeSegment.DN:
            case EAssetTypeSegment.CLAC:
            case EAssetTypeSegment.SD:
            case EAssetTypeSegment.Q:
                return segment;

            case EAssetTypeSegment.FG:
                return EAssetTypeSegment.VT;

            case EAssetTypeSegment.BB:
                return EAssetTypeSegment.BC;

            case EAssetTypeSegment.SDP:
                return EAssetTypeSegment.SD;

            case EAssetTypeSegment.AE:
            case EAssetTypeSegment.AR:
            case EAssetTypeSegment.FAT:
            case EAssetTypeSegment.FR:
                return EAssetTypeSegment.Q;
        }
    }

    private static getKey(type: EAssetType, segment: EAssetTypeSegment) {
        return type + '/' + AssetHelper.getSubstitute(segment);
    }

    public static getRandomShipClassImage(shipClassType: EShipClassTypeEnum) {
        let segmentElement: EAssetTypeSegment = AssetHelper.map(shipClassType);
        console.log(shipClassType, segmentElement)
        return AssetHelper.getRandomImage(EAssetType.SHIPS, segmentElement);
    }

    private static getRandomImage(type: EAssetType, segment: EAssetTypeSegment) {

        const key = AssetHelper.getKey(type, segment);
        const files = this.KEY_TO_PATH.get(key)!;
        let filePath = '';
        if (files.length == 1) {
            filePath = files[0];
        } else {
            const index = AssetHelper.randomIntFromInterval(0, files.length - 1);
            filePath = files[index];
        }

        return 'assets/images/' + key + '/' + filePath;
    }

    private static randomIntFromInterval(min: number, max: number) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    private static map(shipClassType: EShipClassTypeEnum) {
        switch (shipClassType) {
            case EShipClassTypeEnum.LAC:
                return EAssetTypeSegment.LAC;
            case EShipClassTypeEnum.VT:
                return EAssetTypeSegment.VT;
            case EShipClassTypeEnum.FG:
                return EAssetTypeSegment.FG;
            case EShipClassTypeEnum.DD:
                return EAssetTypeSegment.DD;
            case EShipClassTypeEnum.CL:
                return EAssetTypeSegment.CL;
            case EShipClassTypeEnum.CA:
                return EAssetTypeSegment.CA;
            case EShipClassTypeEnum.BC:
                return EAssetTypeSegment.BC;
            case EShipClassTypeEnum.BCP:
                return EAssetTypeSegment.BCP;
            case EShipClassTypeEnum.BB:
                return EAssetTypeSegment.BB;
            case EShipClassTypeEnum.DN:
                return EAssetTypeSegment.DN;
            case EShipClassTypeEnum.CLAC:
                return EAssetTypeSegment.CLAC;
            case EShipClassTypeEnum.SD:
                return EAssetTypeSegment.SD;
            case EShipClassTypeEnum.SDP:
                return EAssetTypeSegment.SDP;
            case EShipClassTypeEnum.AE:
                return EAssetTypeSegment.AE;
            case EShipClassTypeEnum.AR:
                return EAssetTypeSegment.AR;
            case EShipClassTypeEnum.FAT:
                return EAssetTypeSegment.FAT;
            case EShipClassTypeEnum.FR:
                return EAssetTypeSegment.FR;
            default:
                throw new Error("Yeah please repair me");
        }
    }
}
