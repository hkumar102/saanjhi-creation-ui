declare global {
  interface Date {
    toDateOnlyString(): string;
  }
}

Date.prototype.toDateOnlyString = function(): string {
  return this.toISOString().substring(0, 10);
};

export {};