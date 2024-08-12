import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Location, LocationType, Prisma } from "@prisma/client";

@Injectable()
export class LocationsService {
  constructor(
    private prisma: PrismaService,
    private logger: Logger
  ) {}

  async create(data: Prisma.LocationCreateInput): Promise<Location> {
    try {
      if (!data.type) {
        throw new BadRequestException("Location type is required");
      }

      if (!Object.values(LocationType).includes(data.type as LocationType)) {
        const validTypes = Object.values(LocationType).join(", ");
        throw new BadRequestException(
          `Invalid location type. Valid types are: ${validTypes}`
        );
      }

      if (data.code) {
        const existingLocation = await this.prisma.location.findUnique({
          where: { code: data.code },
        });

        if (existingLocation) {
          throw new UnprocessableEntityException(
            `Location with code ${data.code} already exists`
          );
        }
      }

      return this.prisma.location.create({ data });
    } catch (error) {
      this.logger.error(
        "Error creating location",
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  async findAll(): Promise<Location[]> {
    try {
      return this.prisma.location.findMany();
    } catch (error) {
      this.logger.error(
        "Error fetching all locations",
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  async findOne(id: number): Promise<Location> {
    try {
      const location = await this.prisma.location.findUnique({
        where: { id },
        include: { children: true, parent: true },
      });
      if (!location) {
        throw new NotFoundException(`Location with ID ${id} not found`);
      }
      return location;
    } catch (error) {
      this.logger.error(
        `Error fetching location with ID ${id}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  async update(
    id: number,
    data: Prisma.LocationUpdateInput & { parentId?: number | null }
  ): Promise<Location> {
    // Extract parentId from the data
    const { parentId, ...prismaUpdateData } = data;

    // Check if parentId is being updated
    if (parentId !== undefined) {
      if (parentId === id) {
        throw new BadRequestException(
          `Parent ID cannot be the same as the location's own ID`
        );
      }

      // Convert parentId to Prisma's expected format
      prismaUpdateData.parent =
        parentId === null
          ? { disconnect: true }
          : { connect: { id: parentId } };
    }

    try {
      const updatedLocation = await this.prisma.location.update({
        where: { id },
        data: prismaUpdateData,
      });
      return updatedLocation;
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Location with ID ${id} not found`);
      }
      this.logger.error(
        `Error updating location with ID ${id}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  async remove(id: number): Promise<Location> {
    // First, check if the location exists and if it has any children
    const locationWithChildren = await this.prisma.location.findFirst({
      where: { id },
      include: { children: { select: { id: true }, take: 1 } },
    });

    if (!locationWithChildren) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    if (locationWithChildren.children.length > 0) {
      throw new UnprocessableEntityException(
        `Cannot delete location with ID ${id} because it has child locations`
      );
    }

    try {
      return await this.prisma.location.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Location with ID ${id} not found`);
      }
      this.logger.error(
        `Error deleting location with ID ${id}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }
}
