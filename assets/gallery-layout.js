// Divide complete desktop rows between two pages; keep any extra row on page two.
export function shortPageSizes(caseCount) {
  if (!Number.isInteger(caseCount) || caseCount < 6 || caseCount % 3 !== 0) {
    throw new Error('Short galleries require at least two complete three-column rows.');
  }
  const firstPage = Math.floor(caseCount / 6) * 3;
  return [firstPage, caseCount - firstPage];
}
