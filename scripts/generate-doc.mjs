import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, ExternalHyperlink,
} from 'docx';
import { writeFileSync } from 'fs';

function heading(text, level) {
  const map = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 };
  return new Paragraph({ heading: map[level], children: [new TextRun({ text, bold: true })] });
}

function p(text) {
  return new Paragraph({ children: [new TextRun(text)], spacing: { after: 120 } });
}

function bold(text) {
  return new TextRun({ text, bold: true });
}

function reg(text) {
  return new TextRun(text);
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [new TextRun(text)],
    bullet: { level },
    spacing: { after: 60 },
  });
}

function mono(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Consolas', size: 20 })],
    spacing: { after: 60 },
  });
}

function link(text, url) {
  return new ExternalHyperlink({
    children: [new TextRun({ text, style: 'Hyperlink' })],
    link: url,
  });
}

function refEntry(authors, title, source, url) {
  return new Paragraph({
    children: [
      new TextRun(authors + ' '),
      new TextRun({ text: title, italics: true }),
      new TextRun(' ' + source + ' '),
      link(url, url),
    ],
    bullet: { level: 0 },
    spacing: { after: 100 },
  });
}

const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const thinBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function tableCell(text, bold_ = false, shading = undefined) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold: bold_, size: 20 })] })],
    borders: thinBorders,
    width: { size: 50, type: WidthType.PERCENTAGE },
    ...(shading ? { shading: { fill: shading } } : {}),
  });
}

function simpleTable(headers, rows) {
  return new Table({
    rows: [
      new TableRow({ children: headers.map(h => tableCell(h, true, 'F2F2F2')) }),
      ...rows.map(row => new TableRow({ children: row.map(cell => tableCell(cell)) })),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

const doc = new Document({
  sections: [{
    properties: {},
    children: [
      heading('PetMatcher — Matching Algorithm', 1),

      heading('Overview', 2),
      p('The matching algorithm scores and ranks pets for each adopter based on their profile preferences and swipe behavior. It does not use AI or machine learning — it uses simple counting and comparison logic.'),
      new Paragraph({ children: [bold('Maximum possible score: 120 points')], spacing: { after: 200 } }),

      heading('Database Tables Involved', 2),
      simpleTable(['Table', 'Purpose'], [
        ['profiles', 'Stores the adopter\'s preferences: preferred_pet_types, activity_level, has_children, has_other_pets'],
        ['pets', 'Stores each pet\'s attributes: species, energy_level, good_with_kids, good_with_pets, size'],
        ['interactions', 'Records every swipe: user_id, pet_id, type (like or skip)'],
      ]),

      heading('Step 1: Preferences Are Set at Registration', 2),
      p('When an adopter registers on /register, the form saves their choices to the profiles table:'),
      bullet('Preferred pet types — which animals they want (dog, cat, rabbit, other)'),
      bullet('Activity level — low, medium, or high'),
      bullet('Has children — yes or no'),
      bullet('Has other pets — yes or no'),
      p('These preferences are the starting point for the algorithm before any swipes happen.'),

      heading('Step 2: Browse Page Loads', 2),
      p('When the adopter opens /browse, three queries run in parallel:'),
      bullet('Fetch the adopter\'s preferences from profiles'),
      bullet('Fetch all their past swipes from interactions'),
      bullet('Fetch all available pets from pets'),
      p('Already-seen pets (any pet the user has a like or skip for) are filtered out. The remaining pets are passed to scoreAndSortPets().'),

      heading('Step 3: Each Pet Gets Scored', 2),
      p('scoreAndSortPets() runs two functions on every pet and adds the results together.'),

      heading('Function 1: calculateMatchScore(pet, preferences) — 0 to 100 points', 3),
      p('Compares the adopter\'s profile preferences against the pet\'s attributes. Four checks:'),

      new Paragraph({ children: [bold('Species Match (30 points)')], spacing: { before: 120, after: 60 } }),
      bullet('If the pet\'s species is in the adopter\'s preferred_pet_types array → +30'),
      bullet('If not → +0'),
      bullet('Example: adopter wants [dog, cat], pet is a dog → +30'),

      new Paragraph({ children: [bold('Energy Level Match (25 points)')], spacing: { before: 120, after: 60 } }),
      bullet('If the pet\'s energy_level exactly matches the adopter\'s activity_level → +25'),
      bullet('If either side is "medium" (partial match) → +15'),
      bullet('If complete mismatch (e.g. low vs high) → +0'),

      new Paragraph({ children: [bold('Kid-Friendly (25 points)')], spacing: { before: 120, after: 60 } }),
      bullet('If adopter has_children is true and pet good_with_kids is true → +25'),
      bullet('If adopter has_children is true and pet good_with_kids is false → +0'),
      bullet('If adopter has_children is false → +25 (doesn\'t apply, free points)'),

      new Paragraph({ children: [bold('Pet-Friendly (20 points)')], spacing: { before: 120, after: 60 } }),
      bullet('If adopter has_other_pets is true and pet good_with_pets is true → +20'),
      bullet('If adopter has_other_pets is true and pet good_with_pets is false → +0'),
      bullet('If adopter has_other_pets is false → +20 (doesn\'t apply, free points)'),

      p('This function works from the very first browse session — no swipe history needed.'),

      heading('Function 2: calculateBehavioralBonus(pet, userInteractions, allPets) — 0 to 20 points', 3),
      p('This function learns from the adopter\'s swipe history. It only activates after 5 or more swipes.'),
      p('It looks at every like in the interactions table and counts patterns across two attributes:'),
      bullet('Species — what species has the user been liking?'),
      bullet('Energy level — what energy levels has the user been liking?'),
      p('For each attribute, the score is: (times user liked this value / total likes) × 10'),
      p('Each attribute contributes up to 10 points. Maximum total: 20 points.'),

      new Paragraph({ children: [bold('Example:')], spacing: { before: 120, after: 60 } }),
      p('The adopter has liked 10 pets total: 7 dogs, 2 cats, 1 rabbit. Of those, 6 were high energy, 3 medium, 1 low.'),

      new Paragraph({ children: [bold('Scoring a high-energy dog:')], spacing: { before: 80, after: 60 } }),
      bullet('Species: (7/10) × 10 = 7 pts'),
      bullet('Energy: (6/10) × 10 = 6 pts'),
      bullet('Total bonus: 13 pts'),

      new Paragraph({ children: [bold('Scoring a low-energy rabbit:')], spacing: { before: 80, after: 60 } }),
      bullet('Species: (1/10) × 10 = 1 pt'),
      bullet('Energy: (1/10) × 10 = 1 pt'),
      bullet('Total bonus: 2 pts'),

      p('The dog gets a much bigger boost because the adopter\'s behavior shows a clear preference for dogs with high energy.'),

      heading('Step 4: Pets Are Sorted', 2),
      p('scoreAndSortPets() adds both scores together for each pet:'),
      mono('total_score = calculateMatchScore() + calculateBehavioralBonus()'),
      p('All pets are sorted from highest score to lowest. If two pets have the same score, the newer listing appears first.'),

      heading('Step 5: Match Percentage Is Displayed', 2),
      p('The percentage shown on each pet card is:'),
      mono('Math.round((total_score / 120) × 100)'),
      p('A pet scoring 102 out of 120 displays as 85% Match.'),

      heading('Step 6: User Swipes', 2),
      p('The browse page shows one pet at a time. When the adopter swipes:'),
      bullet('Like (heart button) → inserts { user_id, pet_id, type: "like" } into interactions'),
      bullet('Skip (X button) → inserts { user_id, pet_id, type: "skip" } into interactions'),
      p('Each swipe adds one row to the interactions table.'),

      heading('Step 7: The Learning Loop', 2),
      p('When the adopter taps "Start Over", scoreAndSortPets() runs again with the updated interactions data. The behavioral bonus now reflects the new swipe patterns, so the pet order changes.'),
      p('The more the adopter swipes, the more data calculateBehavioralBonus() has, and the more accurately it ranks pets to match their real taste.'),

      heading('Flow Diagram', 2),
      mono('[Registration]'),
      mono('      ↓'),
      mono('Preferences saved to profiles table'),
      mono('      ↓'),
      mono('[Browse Page Loads]'),
      mono('      ↓'),
      mono('Fetch: profiles + pets + interactions'),
      mono('      ↓'),
      mono('For each pet:'),
      mono('  calculateMatchScore()      → base score (0-100)'),
      mono('  calculateBehavioralBonus() → learned bonus (0-20)'),
      mono('  total = base + bonus'),
      mono('      ↓'),
      mono('scoreAndSortPets() → sort by total score descending'),
      mono('      ↓'),
      mono('[Display pets one at a time]'),
      mono('      ↓'),
      mono('User swipes → new row in interactions table'),
      mono('      ↓'),
      mono('[Start Over] → re-run scoreAndSortPets()'),
      mono('      ↓'),
      mono('Pets re-ranked → algorithm has "learned"'),

      heading('Key Files', 2),
      simpleTable(['File', 'What it contains'], [
        ['src/lib/utils.js', 'calculateMatchScore(), calculateBehavioralBonus(), scoreAndSortPets()'],
        ['src/app/browse/page.jsx', 'Fetches data, calls scoring functions, displays swipe UI'],
        ['src/app/register/page.jsx', 'Saves adopter preferences to profiles on registration'],
        ['supabase/schema.sql', 'Database schema for profiles, pets, interactions tables'],
      ]),

      // ============ REFERENCES ============
      heading('References', 2),

      heading('Content-Based Filtering', 3),
      refEntry(
        'Pazzani, M.J. & Billsus, D. (2007).',
        '"Content-Based Recommendation Systems."',
        'The Adaptive Web, Lecture Notes in Computer Science, Vol. 4321, Springer, pp. 325-341.',
        'https://link.springer.com/chapter/10.1007/978-3-540-72079-9_10',
      ),
      refEntry(
        'Lops, P., de Gemmis, M. & Semeraro, G. (2011).',
        '"Content-Based Recommender Systems: State of the Art and Trends."',
        'Recommender Systems Handbook, Springer, pp. 73-105.',
        'https://link.springer.com/chapter/10.1007/978-0-387-85820-3_3',
      ),
      refEntry(
        'Google for Developers.',
        '"Content-Based Filtering."',
        'Machine Learning Recommendation Course.',
        'https://developers.google.com/machine-learning/recommendation/content-based/basics',
      ),

      heading('Implicit Feedback', 3),
      refEntry(
        'Hu, Y., Koren, Y. & Volinsky, C. (2008).',
        '"Collaborative Filtering for Implicit Feedback Datasets."',
        'Proceedings of the 2008 IEEE International Conference on Data Mining (ICDM), pp. 263-272. Winner of the 2017 IEEE ICDM 10-Year Highest-Impact Paper Award.',
        'https://ieeexplore.ieee.org/document/4781121',
      ),
      refEntry(
        'Oard, D.W. & Kim, J. (1998).',
        '"Implicit Feedback for Recommender Systems."',
        'Proceedings of the AAAI Workshop on Recommender Systems, AAAI Press.',
        'https://terpconnect.umd.edu/~oard/pdf/aaai98.pdf',
      ),

      heading('Tinder Algorithm', 3),
      refEntry(
        'Tinder Official (2019).',
        '"Powering Tinder — The Method Behind Our Matching."',
        'Tinder Press Room.',
        'https://www.tinderpressroom.com/powering-tinder-r-the-method-behind-our-matching',
      ),
      refEntry(
        'Carr, A. (2016).',
        '"I Found Out My Secret Internal Tinder Rating And Now I Wish I Hadn\'t."',
        'Fast Company.',
        'https://www.fastcompany.com/3054871/whats-your-tinder-score-inside-the-apps-internal-ranking-system',
      ),

      heading('Hinge Algorithm', 3),
      refEntry(
        'Hinge Official.',
        '"What is Most Compatible?"',
        'Hinge Help Center.',
        'https://help.hinge.co/hc/en-us/articles/360011233073-What-is-Most-Compatible',
      ),
      refEntry(
        'TechCrunch (2018).',
        '"Hinge employs new algorithm to find your \'most compatible\' match."',
        'TechCrunch.',
        'https://techcrunch.com/2018/07/11/hinge-employs-new-algorithm-to-find-your-most-compatible-match-for-you/',
      ),
      refEntry(
        'Harvard Business School Digital Initiative.',
        '"Hinge and Machine Learning: The Makings of a Perfect Match."',
        'Harvard Digital Initiative.',
        'https://d3.harvard.edu/platform-rctom/submission/hinge-and-machine-learning-the-makings-of-a-perfect-match/',
      ),

      heading('Pet Adoption Matching', 3),
      refEntry(
        'Library Progress International (2024).',
        '"PAWrfect Match: A Web-Based Animal Adoption and Rescue System that uses Content-Based Filtering Algorithm for Recommending Potential Adoptees."',
        'Library Progress International.',
        'https://bpasjournals.com/library-science/index.php/journal/article/view/3971/3697',
      ),
      refEntry(
        'Sigmund, K. (2021).',
        '"IMPRNT: A Cross-Platform Mobile Application for Personality-Based Pet Adoption."',
        'UNCW Master of Science in Computer Science & Information Systems Proceedings, Vol. 15, Issue 1.',
        'https://csbapp.uncw.edu/mscsisProceedings/2021/SigmundKinsley.pdf',
      ),
      refEntry(
        'Amirkhani, A. et al. (2022).',
        '"Pet analytics: Predicting adoption speed of pets from their online profiles."',
        'Expert Systems with Applications, Vol. 204, 117596.',
        'https://www.sciencedirect.com/science/article/abs/pii/S0957417422009083',
      ),
    ],
  }],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync('docs/matching-algorithm.docx', buffer);
console.log('Created docs/matching-algorithm.docx');
