/**
 * US presidents — static reference dataset.
 *
 * The previous implementation pinged a Replit-era `api.usa.gov` placeholder
 * (which 404s) just to return an empty list. The list of presidents is
 * genuinely static data, so it ships inline instead of depending on a
 * third-party endpoint that has to be hosted forever.
 */
import * as cache from '../core/cache.js';

const PRESIDENTS = [
  { number: 1, name: 'George Washington', party: 'Independent', start: 1789, end: 1797 },
  { number: 2, name: 'John Adams', party: 'Federalist', start: 1797, end: 1801 },
  { number: 3, name: 'Thomas Jefferson', party: 'Democratic-Republican', start: 1801, end: 1809 },
  { number: 4, name: 'James Madison', party: 'Democratic-Republican', start: 1809, end: 1817 },
  { number: 5, name: 'James Monroe', party: 'Democratic-Republican', start: 1817, end: 1825 },
  { number: 6, name: 'John Quincy Adams', party: 'Democratic-Republican', start: 1825, end: 1829 },
  { number: 7, name: 'Andrew Jackson', party: 'Democrat', start: 1829, end: 1837 },
  { number: 8, name: 'Martin Van Buren', party: 'Democrat', start: 1837, end: 1841 },
  { number: 9, name: 'William Henry Harrison', party: 'Whig', start: 1841, end: 1841 },
  { number: 10, name: 'John Tyler', party: 'Whig', start: 1841, end: 1845 },
  { number: 11, name: 'James K. Polk', party: 'Democrat', start: 1845, end: 1849 },
  { number: 12, name: 'Zachary Taylor', party: 'Whig', start: 1849, end: 1850 },
  { number: 13, name: 'Millard Fillmore', party: 'Whig', start: 1850, end: 1853 },
  { number: 14, name: 'Franklin Pierce', party: 'Democrat', start: 1853, end: 1857 },
  { number: 15, name: 'James Buchanan', party: 'Democrat', start: 1857, end: 1861 },
  { number: 16, name: 'Abraham Lincoln', party: 'Republican', start: 1861, end: 1865 },
  { number: 17, name: 'Andrew Johnson', party: 'Democrat', start: 1865, end: 1869 },
  { number: 18, name: 'Ulysses S. Grant', party: 'Republican', start: 1869, end: 1877 },
  { number: 19, name: 'Rutherford B. Hayes', party: 'Republican', start: 1877, end: 1881 },
  { number: 20, name: 'James A. Garfield', party: 'Republican', start: 1881, end: 1881 },
  { number: 21, name: 'Chester A. Arthur', party: 'Republican', start: 1881, end: 1885 },
  { number: 22, name: 'Grover Cleveland', party: 'Democrat', start: 1885, end: 1889 },
  { number: 23, name: 'Benjamin Harrison', party: 'Republican', start: 1889, end: 1893 },
  { number: 24, name: 'Grover Cleveland', party: 'Democrat', start: 1893, end: 1897 },
  { number: 25, name: 'William McKinley', party: 'Republican', start: 1897, end: 1901 },
  { number: 26, name: 'Theodore Roosevelt', party: 'Republican', start: 1901, end: 1909 },
  { number: 27, name: 'William Howard Taft', party: 'Republican', start: 1909, end: 1913 },
  { number: 28, name: 'Woodrow Wilson', party: 'Democrat', start: 1913, end: 1921 },
  { number: 29, name: 'Warren G. Harding', party: 'Republican', start: 1921, end: 1923 },
  { number: 30, name: 'Calvin Coolidge', party: 'Republican', start: 1923, end: 1929 },
  { number: 31, name: 'Herbert Hoover', party: 'Republican', start: 1929, end: 1933 },
  { number: 32, name: 'Franklin D. Roosevelt', party: 'Democrat', start: 1933, end: 1945 },
  { number: 33, name: 'Harry S. Truman', party: 'Democrat', start: 1945, end: 1953 },
  { number: 34, name: 'Dwight D. Eisenhower', party: 'Republican', start: 1953, end: 1961 },
  { number: 35, name: 'John F. Kennedy', party: 'Democrat', start: 1961, end: 1963 },
  { number: 36, name: 'Lyndon B. Johnson', party: 'Democrat', start: 1963, end: 1969 },
  { number: 37, name: 'Richard Nixon', party: 'Republican', start: 1969, end: 1974 },
  { number: 38, name: 'Gerald Ford', party: 'Republican', start: 1974, end: 1977 },
  { number: 39, name: 'Jimmy Carter', party: 'Democrat', start: 1977, end: 1981 },
  { number: 40, name: 'Ronald Reagan', party: 'Republican', start: 1981, end: 1989 },
  { number: 41, name: 'George H. W. Bush', party: 'Republican', start: 1989, end: 1993 },
  { number: 42, name: 'Bill Clinton', party: 'Democrat', start: 1993, end: 2001 },
  { number: 43, name: 'George W. Bush', party: 'Republican', start: 2001, end: 2009 },
  { number: 44, name: 'Barack Obama', party: 'Democrat', start: 2009, end: 2017 },
  { number: 45, name: 'Donald Trump', party: 'Republican', start: 2017, end: 2021 },
  { number: 46, name: 'Joe Biden', party: 'Democrat', start: 2021, end: 2025 },
  { number: 47, name: 'Donald Trump', party: 'Republican', start: 2025, end: 2029 },
];

/**
 * Returns US presidents as of the shipped dataset,
 * optionally filtered by party (e.g. "Republican") or name substring.
 * @param {Object} [params]
 * @param {string} [params.party] - case-insensitive party filter
 * @param {string} [params.name] - case-insensitive name substring filter
 */
export async function getPresidents({ party, name } = {}) {
  const cacheKey = `politics:presidents:${party || 'all'}:${name || ''}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let list = PRESIDENTS;
  if (party) list = list.filter((p) => p.party.toLowerCase() === party.toLowerCase());
  if (name) list = list.filter((p) => p.name.toLowerCase().includes(name.toLowerCase()));

  const result = { count: list.length, presidents: list, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
