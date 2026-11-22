import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import type {Plugin} from 'vite';
import type {Lesson, Question} from './src/biology/learning/lesson-contract';

function practiceIndex(): Plugin {
  const moduleId = 'virtual:biolab-practice-index';
  const resolvedId = '\0' + moduleId;
  const directory = new URL('./src/biology/learning/', import.meta.url);
  const catalogPath = fileURLToPath(new URL('catalog.json', directory));

  return {
    name: 'biolab-practice-index',
    resolveId(id) {
      if (id === moduleId) return resolvedId;
    },
    load(id) {
      if (id !== resolvedId) return;
      this.addWatchFile(catalogPath);
      const catalog: Record<string, {path: string}> = JSON.parse(readFileSync(catalogPath, 'utf8'));
      const index: Record<string, Partial<Record<Question['paper'], {SL: number; HL: number}>>> = {};

      for (const {path} of Object.values(catalog)) {
        const lessonPath = fileURLToPath(new URL(path, directory));
        this.addWatchFile(lessonPath);
        const lesson: Lesson = JSON.parse(readFileSync(lessonPath, 'utf8'));
        const counts: typeof index[string] = {};
        for (const question of lesson.questions) {
          if (!question.options?.length && !question.markingPoints?.length) continue;
          const count = counts[question.paper] ??= {SL: 0, HL: 0};
          if (question.level === 'shared') count.SL++;
          count.HL++;
        }
        index[lesson.topicId] = counts;
      }
      return `export default ${JSON.stringify(index)};`;
    },
    handleHotUpdate({file, modules, server}) {
      if (file !== catalogPath && !file.endsWith('/lesson.json')) return;
      const indexModule = server.moduleGraph.getModuleById(resolvedId);
      if (indexModule) return [...modules, indexModule];
    },
  };
}

export default defineConfig({plugins: [react(), practiceIndex()], base: './'});
