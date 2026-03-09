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

export interface DailyTaskStatus {
  chatDone: boolean;
  relaxDone: boolean;
}

export function getDailyTaskStatus(): DailyTaskStatus {
  return {
    chatDone: getDailyChatDone(),
    relaxDone: getDailyRelaxDone(),
  };
}

/**
 * 从 localStorage 中计算连续天数（聊天或放松）。
 * 从昨天往前回溯，今天不计入（今天的任务可能还没完成）。
 */
export function getConsecutiveDays(): number {
  try {
    let count = 0;
    const now = new Date();
    for (let i = 1; i <= 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const hasChatOrRelax =
        !!localStorage.getItem('daily_chat_' + key) ||
        !!localStorage.getItem('daily_relax_' + key);
      if (hasChatOrRelax) {
        count++;
      } else {
        break;
      }
    }
    return count;
  } catch {
    return 0;
  }
}
