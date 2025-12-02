import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const tz = 'Asia/Dhaka';

export const startAndEndOfDate = (
  date?: string | number | Date | dayjs.Dayjs,
) => {
  const dayjsDhaka = dayjs(date).tz(tz);

  const startOfToday = dayjsDhaka.startOf('day');
  const endOfToday = startOfToday.endOf('day');

  const startOfLastday = startOfToday.subtract(1, 'day');
  const endOfLastday = startOfLastday.endOf('day');

  const startOfMonth = startOfToday.startOf('month');
  const endOfMonth = endOfToday.endOf('month');

  const startOfPreviousMonth = startOfToday
    .subtract(1, 'month')
    .startOf('month');
  const endOfPreviousMonth = endOfToday.subtract(1, 'month').endOf('month');

  return {
    startOfToday: startOfToday.toDate(),
    endOfToday: endOfToday.toDate(),
    startOfLastday: startOfLastday.toDate(),
    endOfLastday: endOfLastday.toDate(),
    startOfMonth: startOfMonth.toDate(),
    endOfMonth: endOfMonth.toDate(),
    startOfPreviousMonth: startOfPreviousMonth.toDate(),
    endOfPreviousMonth: endOfPreviousMonth.toDate(),
  };
};
