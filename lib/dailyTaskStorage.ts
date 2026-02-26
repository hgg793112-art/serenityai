const DATE_KEY = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

export function setDailyChatDone() {
  try {
    localStorage.setItem('daily_chat_' + DATE_KEY(), '1');
  } catch (_) {}
}

export function setDailyRelaxDone() {
  try {
    localStorage.setItem('daily_relax_' + DATE_KEY(), '1');
  } catch (_) {}
}

export function getDailyChatDone(): boolean {
  try {
    return !!localStorage.getItem('daily_chat_' + DATE_KEY());
  } catch {
    return false;
  }
}

export function getDailyRelaxDone(): boolean {
  try {
    return !!localStorage.getItem('daily_relax_' + DATE_KEY());
  } catch {
    return false;
  }
}
