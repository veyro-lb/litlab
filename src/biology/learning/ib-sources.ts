/** The only two default student-facing teaching sources.
 * Research and asset-rights provenance remain in the lesson JSON, not in this list.
 * The IB Guide is authoritative; the Hodder book is IB-reviewed, not the syllabus.
 */
export const STUDENT_BIOLOGY_SOURCES = [
  {
    id: 'ib-biology-guide-fa2025',
    title: 'Official IB Biology Guide — First Assessment 2025',
    description: 'Official syllabus, required understandings and assessment framework.',
    url: 'https://ibo.org/programmes/diploma-programme/curriculum/sciences/biology/',
  },
  {
    id: 'hodder-biology-third-edition-2023',
    title: 'Biology for the IB Diploma Programme — Third Edition (Hodder, 2023)',
    description: 'IB-reviewed coursebook used to develop original teaching explanations and examples.',
    url: 'https://www.hachettelearning.com/biology/biology-for-the-ib-diploma-third-edition',
  },
] as const;

export const BIOLOGY_SOURCE_POLICY = {
  coreSourceIds: STUDENT_BIOLOGY_SOURCES.map(source => source.id),
  thirdPartyEducationalReferences: 'internal-provenance-only',
  imageRights: 'retained-per-asset',
  reviewStatus: 'qualified-review-required',
} as const;
