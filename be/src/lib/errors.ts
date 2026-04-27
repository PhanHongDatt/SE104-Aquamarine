export class OutOfStockError extends Error {
  constructor(message: string = "Sản phẩm đã hết hàng trong kho") {
    super(message);
    this.name = "OutOfStockError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
