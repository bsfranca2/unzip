export const decodeDateTime = (date: number, time: number) => {
  return new Date(
    ((date >>> 9) & 127) + 1980,
    ((date >>> 5) & 15) - 1,
    date & 31,
    (time >>> 11) & 31,
    (time >>> 5) & 63,
    (time & 31) * 2
  );
};
