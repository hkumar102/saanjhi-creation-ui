declare global {
  interface Date {
    toDateOnlyString(): string;
  }
  interface String {
    toDateOnly(): string;
    toISODateString(): string;
  }
}

Date.prototype.toDateOnlyString = function (): string {
  return this.toISOString().substring(0, 10);
};

String.prototype.toDateOnly = function (): string {
  return this.substring(0, 10);
};

String.prototype.toISODateString = function (this: string): string {
  const date = new Date(this);
  return date.toISOString();
}

export { };