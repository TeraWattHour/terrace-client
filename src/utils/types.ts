export type RefType<T extends Element> = T | ((el: T) => void) | undefined;
