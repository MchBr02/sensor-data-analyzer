// /utils/combinations.ts


/**
 * Generates all possible combinations of values from the given value map.
 * @param map An object where each key maps to an array of possible values.
 * @returns An array of objects, each representing one combination.
 */
export function generateCombinationsFromMap<T extends Record<string, readonly unknown[]>>(
    map: T
  ): Array<{ [K in keyof T]: T[K][number] }> {
    const entries = Object.entries(map) as [keyof T, readonly unknown[]][];
  
    const cartesian = (
      index = 0,
      current: Partial<{ [K in keyof T]: T[K][number] }> = {}
    ): Array<{ [K in keyof T]: T[K][number] }> => {
      if (index === entries.length) return [current as { [K in keyof T]: T[K][number] }];
  
      const [key, values] = entries[index];
      const results: Array<{ [K in keyof T]: T[K][number] }> = [];
  
      for (const value of values) {
        results.push(...cartesian(index + 1, { ...current, [key]: value }));
      }
  
      return results;
    };
  
    return cartesian();
  }