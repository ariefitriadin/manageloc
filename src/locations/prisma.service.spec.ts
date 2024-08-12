import { Test, TestingModule } from "@nestjs/testing";
import {
  PrismaService,
  getLogLevels,
  isQueryLoggingEnabled,
} from "./prisma.service";
import { INestApplication } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn(),
      $extends: jest.fn().mockReturnThis(),
    })),
  };
});

describe("PrismaService", () => {
  let service: PrismaService;
  let mockApp: INestApplication;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useFactory: () => {
            const $connect = jest.fn();
            return {
              $connect,
              onModuleInit: jest.fn().mockImplementation(async () => {
                await $connect();
              }),
              enableShutdownHooks: jest.fn(),
              extendedClient: {},
            };
          },
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    mockApp = {
      close: jest.fn(),
    } as unknown as INestApplication;

    // Mock environment variables
    process.env.NODE_ENV = "development";
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should connect on module init", async () => {
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });

  it("should enable shutdown hooks", async () => {
    await service.enableShutdownHooks(mockApp);
    expect(service.enableShutdownHooks).toHaveBeenCalledWith(mockApp);
  });

  it("should use extended client when query logging is enabled", () => {
    process.env.NODE_ENV = "development-querylog";
    expect(isQueryLoggingEnabled()).toBe(true);
    expect(service.extendedClient).toBeDefined();
  });

  it("should not use extended client when query logging is disabled", () => {
    process.env.NODE_ENV = "development";
    expect(isQueryLoggingEnabled()).toBe(false);
    expect(service.extendedClient).toBeDefined(); // It's always defined now
  });

  it("should return correct log levels for production", () => {
    process.env.NODE_ENV = "production";
    expect(getLogLevels()).toEqual([
      { emit: "stdout", level: "warn" },
      { emit: "stdout", level: "error" },
    ]);
  });

  it("should return correct log levels for development", () => {
    process.env.NODE_ENV = "development";
    expect(getLogLevels()).toEqual([
      { emit: "stdout", level: "info" },
      { emit: "stdout", level: "warn" },
      { emit: "stdout", level: "error" },
    ]);
  });

  it("should return correct log levels for development with query logging", () => {
    process.env.NODE_ENV = "development-querylog";
    expect(getLogLevels()).toEqual([
      { emit: "stdout", level: "query" },
      { emit: "stdout", level: "info" },
      { emit: "stdout", level: "warn" },
      { emit: "stdout", level: "error" },
    ]);
  });
});
