export function calculateFormattingScore(resumeText) {
  if (!resumeText) return 0;

  const sections = [
    { name: 'Summary', keywords: ['SUMMARY', 'PROFESSIONAL SUMMARY', 'OBJECTIVE', 'PROFILE'] },
    { name: 'Experience', keywords: ['EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT HISTORY'] },
    { name: 'Education', keywords: ['EDUCATION', 'ACADEMIC BACKGROUND', 'QUALIFICATIONS'] },
    { name: 'Skills', keywords: ['SKILLS', 'CORE SKILLS', 'TECHNICAL SKILLS', 'COMPETENCIES'] },
    { name: 'Certifications', keywords: ['CERTIFICATIONS', 'CERTIFICATES', 'LICENSES', 'AWARDS'] },
  ];

  let foundCount = 0;
  const upperText = resumeText.toUpperCase();

  sections.forEach(section => {
    if (section.keywords.some(k => upperText.includes(k))) {
      foundCount++;
    }
  });

  return Math.min(100, foundCount * 20);
}

export function calculateReadabilityScore(resumeText) {
  if (!resumeText) return 0;

  const words = resumeText.trim().split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;

  // Find bullet points: lines starting with '-', '*', or '•'
  const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const bulletPoints = lines.filter(l => l.startsWith('-') || l.startsWith('*') || l.startsWith('•'));
  const bulletCount = bulletPoints.length;

  let score = 100;

  // Penalty for long bullets: average bullet length > 25 words
  if (bulletCount > 0) {
    const totalBulletWords = bulletPoints.reduce((acc, bullet) => {
      return acc + bullet.split(/\s+/).filter(w => w.length > 0).length;
    }, 0);
    const avgLength = totalBulletWords / bulletCount;
    if (avgLength > 25) {
      score -= 30;
    }
  } else {
    // If no bullets at all, it's a readability issue
    score -= 30;
  }

  // Penalty for resumes with fewer than 5 bullet points
  if (bulletCount < 5) {
    score -= 30;
  }

  return Math.max(0, score);
}
