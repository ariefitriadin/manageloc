import { Test, TestingModule } from "@nestjs/testing";
import { LocationsService } from "./locations.service";
import { PrismaService } from "./prisma.service";
import {
  BadRequestException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Location, LocationType, Prisma } from "@prisma/client";

describe("LocationsService", () => {
  let service: LocationsService;
  let prismaService: PrismaService;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    logger = {
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      verbose: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: PrismaService,
          useValue: {
            location: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: Logger,
          useValue: logger,
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe("create", () => {
    it("should create a location", async () => {
      const createDto: Prisma.LocationCreateInput = {
        name: "Test Location",
        code: "TEST001",
        type: LocationType.BUILDING,
        level: 1,
      };
      const expectedResult: Location = {
        id: 1,
        ...createDto,
        parentId: null,
        description: null,
        area: new Prisma.Decimal(0),
        x: 0,
        y: 0,
        z: 0,
      };
      jest
        .spyOn(prismaService.location, "create")
        .mockResolvedValue(expectedResult);
      jest.spyOn(prismaService.location, "findUnique").mockResolvedValue(null);

      const result = await service.create(createDto);
      expect(result).toEqual(expectedResult);
    });

    it("should throw BadRequestException if type is missing", async () => {
      const createDto: any = {
        name: "Test Location",
        code: "TEST001",
        level: 1,
      };
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw BadRequestException if type is invalid", async () => {
      const createDto: any = {
        name: "Test Location",
        code: "TEST001",
        type: "INVALID_TYPE",
        level: 1,
      };
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw UnprocessableEntityException if location with same code exists", async () => {
      const createDto: Prisma.LocationCreateInput = {
        name: "Test Location",
        code: "TEST001",
        type: LocationType.BUILDING,
        level: 1,
      };
      jest
        .spyOn(prismaService.location, "findUnique")
        .mockResolvedValue({ id: 1 } as Location);
      await expect(service.create(createDto)).rejects.toThrow(
        UnprocessableEntityException
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return an array of locations", async () => {
      const expectedResult = [{ id: 1, name: "Test Location" }];
      jest
        .spyOn(prismaService.location, "findMany")
        .mockResolvedValue(expectedResult as Location[]);

      const result = await service.findAll();
      expect(result).toEqual(expectedResult);
    });
  });

  describe("findOne", () => {
    it("should return a location if found", async () => {
      const expectedResult = { id: 1, name: "Test Location" };
      jest
        .spyOn(prismaService.location, "findUnique")
        .mockResolvedValue(expectedResult as Location);

      const result = await service.findOne(1);
      expect(result).toEqual(expectedResult);
    });

    it("should throw NotFoundException if location not found", async () => {
      jest.spyOn(prismaService.location, "findUnique").mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a location", async () => {
      const updateDto: Prisma.LocationUpdateInput & {
        parentId?: number | null;
      } = {
        name: "Updated Location",
      };
      const expectedResult = { id: 1, name: "Updated Location" };
      jest
        .spyOn(prismaService.location, "update")
        .mockResolvedValue(expectedResult as Location);

      const result = await service.update(1, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it("should throw BadRequestException if parentId is the same as id", async () => {
      const updateDto = { parentId: 1 };
      await expect(service.update(1, updateDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should update parent relationship when parentId is provided", async () => {
      const updateDto = { parentId: 2 };
      const expectedResult = { id: 1, name: "Test Location", parentId: 2 };
      jest
        .spyOn(prismaService.location, "update")
        .mockResolvedValue(expectedResult as Location);

      const result = await service.update(1, updateDto);
      expect(result).toEqual(expectedResult);
      expect(prismaService.location.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { parent: { connect: { id: 2 } } },
      });
    });

    it("should disconnect parent when parentId is null", async () => {
      const updateDto = { parentId: null };
      const expectedResult = { id: 1, name: "Test Location", parentId: null };
      jest
        .spyOn(prismaService.location, "update")
        .mockResolvedValue(expectedResult as Location);

      const result = await service.update(1, updateDto);
      expect(result).toEqual(expectedResult);
      expect(prismaService.location.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { parent: { disconnect: true } },
      });
    });

    it("should throw NotFoundException if location not found during update", async () => {
      jest
        .spyOn(prismaService.location, "update")
        .mockRejectedValue({ code: "P2025" });
      await expect(service.update(1, {})).rejects.toThrow(NotFoundException);
    });

    it("should log and rethrow error if update fails with unknown error", async () => {
      const error = new Error("Unknown error");
      jest.spyOn(prismaService.location, "update").mockRejectedValue(error);

      await expect(service.update(1, {})).rejects.toThrow("Unknown error");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should remove a location", async () => {
      const expectedResult = { id: 1, name: "Deleted Location" };
      jest.spyOn(prismaService.location, "findFirst").mockResolvedValue({
        ...expectedResult,
        children: [],
      } as unknown as Location);
      jest
        .spyOn(prismaService.location, "delete")
        .mockResolvedValue(expectedResult as Location);

      const result = await service.remove(1);
      expect(result).toEqual(expectedResult as Location);
    });

    it("should throw NotFoundException if location not found", async () => {
      jest.spyOn(prismaService.location, "findFirst").mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it("should throw UnprocessableEntityException if location has children", async () => {
      jest.spyOn(prismaService.location, "findFirst").mockResolvedValue({
        id: 1,
        children: [{ id: 2 }],
      } as unknown as Location);
      await expect(service.remove(1)).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it("should throw NotFoundException if location not found during delete", async () => {
      jest
        .spyOn(prismaService.location, "findFirst")
        .mockResolvedValue({ id: 1, children: [] } as unknown as Location);
      jest
        .spyOn(prismaService.location, "delete")
        .mockRejectedValue({ code: "P2025" });
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it("should log and rethrow error if delete fails with unknown error", async () => {
      jest
        .spyOn(prismaService.location, "findFirst")
        .mockResolvedValue({ id: 1, children: [] } as unknown as Location);
      const error = new Error("Unknown error");
      jest.spyOn(prismaService.location, "delete").mockRejectedValue(error);
      await expect(service.remove(1)).rejects.toThrow("Unknown error");
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
