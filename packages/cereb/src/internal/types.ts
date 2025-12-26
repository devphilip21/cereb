/**
 * Utility type that removes readonly modifier from all properties.
 * Used internally to modify readonly Signal objects.
 */
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Deep version of Mutable that recursively removes readonly from nested objects.
 */
export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};
