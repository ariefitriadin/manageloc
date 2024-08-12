import { Test, TestingModule } from "@nestjs/testing";
import { LocationsController } from "./locations.controller";
import { LocationsService } from "./locations.service";
import { CreateLocationDto, UpdateLocationDto } from "./dto/location.dto";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { Prisma, Location, LocationType } from "@prisma/client";

describe("LocationsController", () => {
  let controller: LocationsController;
  let service: LocationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [
        {
          provide: LocationsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LocationsController>(LocationsController);
    service = module.get<LocationsService>(LocationsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a location", async () => {
      const dto: CreateLocationDto = {
        name: "Test Location",
        code: "TEST001",
        type: "BUILDING" as LocationType,
        level: 1,
      };
      const expectedResult: Location = {
        id: 1,
        name: "Test Location",
        code: "TEST001",
        type: "BUILDING" as LocationType,
        parentId: null,
        level: 1,
        description: null,
        area: new Prisma.Decimal(0),
        x: 0,
        y: 0,
        z: 0,
      };
      jest.spyOn(service, "create").mockResolvedValue(expectedResult);

      const result = await controller.create(dto);
      expect(result).toEqual(expectedResult);
    });

    it("should throw BadRequestException if create fails", async () => {
      const dto: CreateLocationDto = {
        name: "Test Location",
        code: "TEST001",
        type: "BUILDING" as LocationType,
        level: 1,
      };
      jest
        .spyOn(service, "create")
        .mockRejectedValue(new BadRequestException("Create failed"));

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe("findAll", () => {
    it("should return an array of locations", async () => {
      const expectedResult = [{ id: 1, name: "Test Location" }];
      jest
        .spyOn(service, "findAll")
        .mockResolvedValue(expectedResult as Location[]);

      const result = await controller.findAll();
      expect(result).toEqual(expectedResult);
    });
  });

  describe("findOne", () => {
    it("should return a location if found", async () => {
      const expectedResult = { id: 1, name: "Test Location" };
      jest
        .spyOn(service, "findOne")
        .mockResolvedValue(expectedResult as Location);

      const result = await controller.findOne("1");
      expect(result).toEqual(expectedResult);
    });

    it("should throw NotFoundException if location not found", async () => {
      jest
        .spyOn(service, "findOne")
        .mockRejectedValue(new NotFoundException("Location not found"));

      await expect(controller.findOne("1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a location", async () => {
      const dto: UpdateLocationDto = {
        name: "Updated Location",
        code: "TEST001",
        type: "BUILDING" as LocationType,
        level: 1,
      };
      const expectedResult = { id: 1, name: "Updated Location" };
      jest
        .spyOn(service, "update")
        .mockResolvedValue(expectedResult as Location);

      const result = await controller.update("1", dto);
      expect(result).toEqual(expectedResult);
    });

    it("should throw NotFoundException if location not found during update", async () => {
      const dto: UpdateLocationDto = {
        name: "Updated Location",
        code: "TEST001",
        type: "BUILDING" as LocationType,
        level: 1,
      };
      jest
        .spyOn(service, "update")
        .mockRejectedValue(new NotFoundException("Location not found"));

      await expect(controller.update("1", dto)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw BadRequestException for other update errors", async () => {
      const dto: UpdateLocationDto = {
        name: "Updated Location",
        code: "TEST001",
        type: "BUILDING" as LocationType,
        level: 1,
      };
      jest
        .spyOn(service, "update")
        .mockRejectedValue(new BadRequestException("Update failed"));

      await expect(controller.update("1", dto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("remove", () => {
    it("should remove a location", async () => {
      const expectedResult = { id: 1, name: "Deleted Location" };
      jest
        .spyOn(service, "remove")
        .mockResolvedValue(expectedResult as Location);

      const result = await controller.remove("1");
      expect(result).toEqual(expectedResult);
    });

    it("should throw NotFoundException if location not found during remove", async () => {
      jest
        .spyOn(service, "remove")
        .mockRejectedValue(new NotFoundException("Location not found"));

      await expect(controller.remove("1")).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException for other remove errors", async () => {
      jest
        .spyOn(service, "remove")
        .mockRejectedValue(new BadRequestException("Remove failed"));

      await expect(controller.remove("1")).rejects.toThrow(BadRequestException);
    });
  });
});
