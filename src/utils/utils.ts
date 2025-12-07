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

function encodeCol(col: number): string {
  const letr = {
    '0': 'A',
    '1': 'B',
    '2': 'C',
    '3': 'D',
    '4': 'E',
    '5': 'F',
    '6': 'G',
    '7': 'H',
    '8': 'I',
    '9': 'J',
    '10': 'K',
    '11': 'L',
    '12': 'M',
    '13': 'N',
    '14': 'O',
    '15': 'P',
    '16': 'Q',
    '17': 'R',
    '18': 'S',
    '19': 'T',
    '20': 'U',
    '21': 'V',
    '22': 'W',
    '23': 'X',
    '24': 'Y',
    '25': 'Z',
  };

  const div = ((col / 26) | 0) - 1;
  const mod = col % 26;

  if (div >= 26) return `${encodeCol(div)}${letr[mod]}`;
  else return `${letr[div] || ''}${letr[mod] || ''}`;
}

export function wsMergedCells(rows: string[][]) {
  rows = rows.map((row) => row.concat(''));

  const merges: string[] = [];

  rows.forEach((row, rowIdx) => {
    let startRow: number;
    let startCol: number;

    row.forEach((col, colIdx) => {
      let prevRowPrevColVal: string;
      let isCurrColPrevRowsHasVal: boolean;

      if (rowIdx && colIdx) {
        let prevRowIdx = rowIdx - 1;
        let prevColIdx = colIdx - 1;

        prevRowPrevColVal = rows[prevRowIdx][prevColIdx];

        isCurrColPrevRowsHasVal = Array.from({
          length: rows.length - rowIdx,
        }).some((_, rowIdx) => rows[rowIdx][colIdx]);
      }

      const isRowLastCol = row.length - 1 === colIdx;

      if (
        col ||
        (prevRowPrevColVal && !col && isCurrColPrevRowsHasVal) ||
        (prevRowPrevColVal === '' && !col && isCurrColPrevRowsHasVal) ||
        isRowLastCol
      ) {
        if (startRow != null && startCol != null) {
          let endRow = rowIdx;

          let endCol = colIdx - 1;

          let idx = -1;
          let length = rows.length - (rowIdx + 1);

          while (++idx < length) {
            const nextRowIdx = rowIdx + idx + 1;

            if (!rows[nextRowIdx][endCol] && !rows[nextRowIdx][startCol])
              endRow++;
            else {
              break;
            }
          }

          merges.push(
            `${encodeCol(startCol)}${startRow + 1}:${encodeCol(endCol)}${endRow + 1}`,
          );
          startRow = null;
          startCol = null;
        }

        if (
          !(
            (prevRowPrevColVal && !col && isCurrColPrevRowsHasVal) ||
            (prevRowPrevColVal === '' && !col && isCurrColPrevRowsHasVal)
          )
        ) {
          startRow = rowIdx;
          startCol = colIdx;
        }
      }
    });
  });

  return merges;
}
