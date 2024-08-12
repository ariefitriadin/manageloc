import { ApiResponseInterceptor } from "./api-response.interceptor";
import { ExecutionContext, CallHandler } from "@nestjs/common";
import { of } from "rxjs";
import { ApiResponse } from "../interfaces/api-response.interface";

describe("ApiResponseInterceptor", () => {
  let interceptor: ApiResponseInterceptor<any>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;

  beforeEach(() => {
    interceptor = new ApiResponseInterceptor();
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          statusCode: 200,
        }),
      }),
    } as any;
    mockCallHandler = {
      handle: jest.fn(),
    } as any;
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  it("should transform the response for status code 200", (done) => {
    const testData = { test: "data" };
    mockCallHandler.handle.mockReturnValue(of(testData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (response: ApiResponse<any>) => {
        expect(response).toEqual({
          code: 200,
          message: "Request successful",
          data: testData,
        });
      },
      complete: done,
    });
  });

  it("should transform the response for status code 201", (done) => {
    const testData = { test: "data" };
    mockCallHandler.handle.mockReturnValue(of(testData));
    mockExecutionContext.switchToHttp().getResponse().statusCode = 201;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (response: ApiResponse<any>) => {
        expect(response).toEqual({
          code: 201,
          message: "Resource created successfully",
          data: testData,
        });
      },
      complete: done,
    });
  });

  it("should transform the response for other status codes", (done) => {
    const testData = { test: "data" };
    mockCallHandler.handle.mockReturnValue(of(testData));
    mockExecutionContext.switchToHttp().getResponse().statusCode = 204;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (response: ApiResponse<any>) => {
        expect(response).toEqual({
          code: 204,
          message: "Request processed successfully",
          data: testData,
        });
      },
      complete: done,
    });
  });
});
