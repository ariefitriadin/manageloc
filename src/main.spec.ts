import { Test } from "@nestjs/testing";
import { INestApplication, VersioningType } from "@nestjs/common";
import { ApiResponseInterceptor } from "./common/interceptors/api-response.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

jest.mock("@nestjs/swagger", () => ({
  SwaggerModule: {
    createDocument: jest.fn(),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    build: jest.fn(),
  })),
}));

jest.mock("./app.module", () => ({
  AppModule: class MockAppModule {},
}));

jest.mock("@nestjs/core", () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      enableVersioning: jest.fn(),
      useLogger: jest.fn(),
      useGlobalInterceptors: jest.fn(),
      useGlobalFilters: jest.fn(),
      get: jest.fn(),
      listen: jest.fn(),
    }),
  },
}));

describe("Bootstrap function", () => {
  let app: INestApplication;
  let configService: ConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();

    app = await NestFactory.create(null);
    configService = {
      get: jest.fn().mockReturnValue("3000"),
    } as any;

    (app.get as jest.Mock).mockReturnValue(configService);
  });

  it("should bootstrap the application correctly", async () => {
    const { bootstrap } = require("./main");
    await bootstrap();

    expect(app.enableVersioning).toHaveBeenCalledWith({
      type: VersioningType.URI,
      prefix: "api/v",
    });

    expect(app.useGlobalInterceptors).toHaveBeenCalledWith(
      expect.any(ApiResponseInterceptor)
    );
    expect(app.useGlobalFilters).toHaveBeenCalledWith(
      expect.any(HttpExceptionFilter)
    );

    const { DocumentBuilder, SwaggerModule } = require("@nestjs/swagger");
    expect(DocumentBuilder).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      "api/v1/documentation",
      expect.anything(),
      undefined
    );

    expect(configService.get).toHaveBeenCalledWith("PORT");
    expect(app.listen).toHaveBeenCalledWith("3000");
  });
});
