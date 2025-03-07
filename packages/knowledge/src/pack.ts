import { ChartID } from './chartID';
import {
  ChartKnowledgeBase,
  ChartKnowledge,
  ChartKnowledgeBaseJSON,
  DataPrerequisiteJSON,
  ChartKnowledgeJSON,
} from './interface';
import { Language, I18N, translateMapping } from './i18n';
import { TransKnowledgeProps } from './i18n/interface';
import { base } from './base';

function newBase() {
  return JSON.parse(JSON.stringify(base));
}

/**
 * @param lang - Language of the CKB.
 * @param completed - True if only charts with fully completed knowledge should be included. Default is false.
 *
 * @beta
 */
export function CKBJson(lang: Language = 'en-US', completed = false) {
  const base = newBase();
  const CKB: ChartKnowledgeBase = {} as ChartKnowledgeBase;
  const ids: ChartID[] = Object.keys(base) as ChartID[];

  // Filtering charts: completed or full.
  ids.forEach((chartID) => {
    const chartKnowledge = base[chartID];
    let valid = true;
    if (completed) {
      const keys = Object.keys(chartKnowledge);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = chartKnowledge[key as keyof ChartKnowledge];
        if (key !== 'alias' && typeof value != 'boolean') {
          if ((Array.isArray(value) && value.length === 0) || !value) {
            valid = false;
            break;
          }
        }
      }
    }

    if (valid) {
      CKB[chartID] = chartKnowledge;
    }
  });

  // Translate.
  let CKBJ: ChartKnowledgeBaseJSON = {} as ChartKnowledgeBaseJSON;

  if (lang && lang != 'en-US') {
    const translator = I18N(lang);
    const chartIDs = Object.keys(CKB) as ChartID[];

    if (translator) {
      chartIDs.forEach((chartID) => {
        CKBJ[chartID] = {} as ChartKnowledgeJSON;
        CKBJ[chartID].id = chartID;
        CKBJ[chartID].name = translator.chartTypes[chartID].name;
        CKBJ[chartID].alias = translator.chartTypes[chartID].alias;
        CKBJ[chartID].def = translator.chartTypes[chartID].def;
        CKBJ[chartID].family = CKB[chartID].family.map((e) => translator.concepts.family[e]);
        CKBJ[chartID].purpose = CKB[chartID].purpose.map((e) => translator.concepts.purpose[e]);
        CKBJ[chartID].coord = CKB[chartID].coord.map((e) => translator.concepts.coord[e]);
        CKBJ[chartID].category = CKB[chartID].category.map((e) => translator.concepts.category[e]);
        CKBJ[chartID].shape = CKB[chartID].shape.map((e) => translator.concepts.shape[e]);
        CKBJ[chartID].channel = CKB[chartID].channel.map((e) => translator.concepts.channel[e]);
        CKBJ[chartID].dataPres = CKB[chartID].dataPres.map((e) => {
          const dataPreJ: DataPrerequisiteJSON = {} as DataPrerequisiteJSON;
          dataPreJ.minQty = e.minQty;
          dataPreJ.maxQty = e.maxQty;
          dataPreJ.fieldConditions = e.fieldConditions.map((l) => translator.concepts.lom[l]);
          return dataPreJ;
        });
      });
    }
  } else {
    CKBJ = CKB;
  }

  return CKBJ;
}

/**
 * @param chartKnowledge - Knowledge of the added chart.
 * @param trans - Versions of translation for the name, alias and definition of the added chart.
 * @beta
 */
export function addChart(chartKnowledge: ChartKnowledge, trans: Record<Language, TransKnowledgeProps>) {
  const id = chartKnowledge.id;
  base[id] = chartKnowledge;

  const langs = Object.keys(trans) as Language[];

  langs.forEach((lang) => {
    const transList = translateMapping[lang];
    if (!transList) {
      // do nothing
    } else {
      transList.chartTypes[id] = trans[lang];
    }
  });
}
