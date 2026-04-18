/**
 * Parses a hours string and returns whether the business is currently open.
 *
 * Handles formats like:
 *   "9:00 AM – 9:00 PM"                        (no days = open every day)
 *   "Monday – Friday, 8:00 AM – 5:00 PM"
 *   "Monday, Tuesday, Wednesday, 9:00 AM – 6:00 PM"
 */

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseTime12h(timeStr: string): number {
  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return -1;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === 'AM' && hours === 12) hours = 0;
  if (period === 'PM' && hours !== 12) hours += 12;
  return hours * 60 + minutes;
}

export function isOpenNow(hours: string): boolean {
  if (!hours) return false;

  const timeMatch = hours.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[–—-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  if (!timeMatch) return false;

  const openMinutes = parseTime12h(timeMatch[1]);
  const closeMinutes = parseTime12h(timeMatch[2]);
  if (openMinutes === -1 || closeMinutes === -1) return false;

  const hasDays = DAY_NAMES.some(day => hours.includes(day));

  if (hasDays) {
    const activeDays = new Set<string>();
    const daysPart = hours.slice(0, timeMatch.index ?? hours.length);
    const rangeRegex = /(\w+)\s*[–—-]\s*(\w+)/g;
    let rangeMatch;
    let processedPart = daysPart;

    while ((rangeMatch = rangeRegex.exec(daysPart)) !== null) {
      const startIdx = DAY_NAMES.indexOf(rangeMatch[1]);
      const endIdx = DAY_NAMES.indexOf(rangeMatch[2]);
      if (startIdx !== -1 && endIdx !== -1) {
        for (let i = startIdx; i <= endIdx; i++) activeDays.add(DAY_NAMES[i]);
        processedPart = processedPart.replace(rangeMatch[0], '');
      }
    }

    DAY_NAMES.forEach(day => {
      if (processedPart.includes(day)) activeDays.add(day);
    });

    const today = DAY_NAMES[new Date().getDay()];
    if (!activeDays.has(today)) return false;
  }
  // No days mentioned → assume open every day, just check time

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}