import { describe, it, expect } from "vitest";
import { AppError, NotFoundError, ValidationError } from "./errors";

describe("AppError", () => {
  it("should create error with message and status code", () => {
    const error = new AppError("Something went wrong", 500);
    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe("AppError");
  });

  it("should be instance of Error", () => {
    const error = new AppError("Test", 400);
    expect(error).toBeInstanceOf(Error);
  });
});

describe("NotFoundError", () => {
  it("should create error with resource name", () => {
    const error = new NotFoundError("Route", "R001");
    expect(error.message).toBe("Route not found: R001");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("NotFoundError");
  });

  it("should be instance of AppError", () => {
    const error = new NotFoundError("Ship", "S001");
    expect(error).toBeInstanceOf(AppError);
  });
});

describe("ValidationError", () => {
  it("should create error with validation message", () => {
    const error = new ValidationError("Invalid amount");
    expect(error.message).toBe("Invalid amount");
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("ValidationError");
  });

  it("should be instance of AppError", () => {
    const error = new ValidationError("Test");
    expect(error).toBeInstanceOf(AppError);
  });
});
