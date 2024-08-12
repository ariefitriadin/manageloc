import { HttpExceptionFilter } from "./http-exception.filter";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ArgumentsHost } from "@nestjs/common";

describe("HttpExceptionFilter", () => {
  let filter: HttpExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockGetResponse: jest.Mock;
  let mockHttpArgumentsHost: jest.Mock;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    mockHttpArgumentsHost = jest
      .fn()
      .mockReturnValue({ getResponse: mockGetResponse });
  });

  it("should be defined", () => {
    expect(filter).toBeDefined();
  });

  it("should handle HttpException", () => {
    const exception = new HttpException(
      "Test exception",
      HttpStatus.BAD_REQUEST
    );
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
      }),
    } as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      code: HttpStatus.BAD_REQUEST,
      message: "Test exception",
      error: undefined,
    });
  });

  it("should handle unknown exceptions", () => {
    const exception = new Error("Unknown error");
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
      }),
    } as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      error: undefined,
    });
  });

  it("should handle HttpException with object response", () => {
    const exception = new HttpException(
      { message: "Custom message", error: "Custom error" },
      HttpStatus.BAD_REQUEST
    );
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
      }),
    } as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      code: HttpStatus.BAD_REQUEST,
      message: "Custom message",
      error: "Custom error",
    });
  });
});
