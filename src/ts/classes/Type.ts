export class Type {
  static isNumber(value: any, coerce = true): boolean {
    return coerce
      ? typeof +value === 'number' && !Number.isNaN(+value)
      : typeof value === 'number' && !Number.isNaN(value);
  }
  static isUndefined(value: any): boolean {
    return typeof value === 'undefined' && !value && value === undefined;
  }
  static isNull(value: any): boolean {
    return typeof value === 'object' && !value && value === null;
  }
}
