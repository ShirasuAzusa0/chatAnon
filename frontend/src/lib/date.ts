import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export function formatTime(date: dayjs.Dayjs, withTime = false) {
  const now = dayjs();

  if (date.isSame(now, 'day')) {
    return date.fromNow(); // xx小时前
  }

  if (date.isSame(now.subtract(1, 'day'), 'day')) {
    return '昨天';
  }

  return withTime ? date.format('YYYY-MM-DD HH:mm:ss') : date.format('YYYY-MM-DD');
}
