import {themes} from '../curriculum/manifest';
import type {Level, Topic} from '../curriculum/schema';
import {inScope} from './content';
import type {Lesson} from './content';
import {understandingTitle} from './UnderstandingLabel';
import {cheatSheetComparisons} from './cheat-sheet-comparisons';
import {cheatSheets} from './cheat-sheet-content';
import {sheetChecks, sheetIllustrations} from './cheat-sheet-extras';

export function getCheatSheet(lesson: Lesson, topic: Topic, level: Level) {
  const sections = lesson.sections.filter(section => inScope(section, level));
  const sheet = cheatSheets[topic.id];
  const groups = [
    {label: 'Core concepts', level: 'shared'},
    {label: topic.level === 'HL' ? 'HL concepts' : 'Additional HL', level: 'HL'},
  ].map(group => ({
    label: group.label,
    higher: group.level === 'HL',
    points: sections.filter(section => section.level === group.level).map(section => {
      const id = section.understandingIds[0];
      return {
        id,
        section,
        heading: understandingTitle(topic, id),
        figure: lesson.assets.find(asset => section.assets.includes(asset.id) && sheetIllustrations.has(asset.id)
          && asset.publicReproductionRights === 'cleared' && !asset.withheldReason),
        mistake: section.misconceptions[0],
      };
    }),
  })).filter(group => group.points.length > 0);

  return {
    id: topic.id,
    title: lesson.title,
    subtitle: `${topic.id} · ${themes[topic.theme].title} · ${level}`,
    filename: `BioLab-${topic.id}-${level}-Cheat-Sheet.pdf`,
    sheet,
    extension: level === 'HL' ? sheet?.hl : undefined,
    check: sheetChecks[topic.id],
    comparisons: sections.flatMap(section => (section.visuals ?? []).flatMap(visual =>
      visual.kind === 'comparison' && cheatSheetComparisons.has(visual.title) ? [visual] : []
    )),
    groups,
    references: lesson.references,
  };
}

export type CheatSheetData = ReturnType<typeof getCheatSheet>;
