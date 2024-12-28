export type UUID = `${string}-${string}-${string}-${string}-${string}`;

/**
 * a content-addressed UUID.
 */
export interface CUUID {
  toString(): UUID
}
