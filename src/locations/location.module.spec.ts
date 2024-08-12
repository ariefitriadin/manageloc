import { Test } from "@nestjs/testing";
import { LocationsModule } from "./locations.module";
import { LocationsController } from "./locations.controller";
import { LocationsService } from "./locations.service";
import { PrismaService } from "./prisma.service";
import { Logger } from "@nestjs/common";

describe("LocationsModule", () => {
  let locationsModule: LocationsModule;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [LocationsModule],
    }).compile();

    locationsModule = module.get<LocationsModule>(LocationsModule);
  });

  it("should be defined", () => {
    expect(locationsModule).toBeDefined();
  });

  it("should have LocationsController", async () => {
    const controller = await Test.createTestingModule({
      imports: [LocationsModule],
    })
      .compile()
      .then((module) => module.get<LocationsController>(LocationsController));

    expect(controller).toBeDefined();
  });

  it("should have LocationsService", async () => {
    const service = await Test.createTestingModule({
      imports: [LocationsModule],
    })
      .compile()
      .then((module) => module.get<LocationsService>(LocationsService));

    expect(service).toBeDefined();
  });

  it("should have PrismaService", async () => {
    const prismaService = await Test.createTestingModule({
      imports: [LocationsModule],
    })
      .compile()
      .then((module) => module.get<PrismaService>(PrismaService));

    expect(prismaService).toBeDefined();
  });

  it("should have Logger", async () => {
    const logger = await Test.createTestingModule({
      imports: [LocationsModule],
    })
      .compile()
      .then((module) => module.get<Logger>(Logger));

    expect(logger).toBeDefined();
  });
});
