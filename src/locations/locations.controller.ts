import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Version,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiUnprocessableEntityResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import { LocationsService } from "./locations.service";
import {
  LocationDto,
  CreateLocationDto,
  UpdateLocationDto,
} from "./dto/location.dto";
import { Location } from "@prisma/client";

@ApiTags("locations")
@Controller("locations")
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Version("1")
  @ApiOperation({ summary: "Create a new location" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "The location has been successfully created.",
    type: LocationDto,
  })
  @ApiBadRequestResponse({
    description: "Invalid input (e.g., missing or invalid location type)",
  })
  @ApiUnprocessableEntityResponse({
    description:
      "Unprocessable entity (e.g., location with the same ID already exists)",
  })
  async create(
    @Body() createLocationDto: CreateLocationDto
  ): Promise<Location> {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  @Version("1")
  @ApiOperation({ summary: "Get all locations" })
  @ApiResponse({
    status: 200,
    description: "Return all locations.",
    type: [LocationDto],
  })
  async findAll(): Promise<Location[]> {
    return this.locationsService.findAll();
  }

  @Get(":id")
  @Version("1")
  @ApiOperation({ summary: "Get a location by id" })
  @ApiParam({ name: "id", type: "number" })
  @ApiResponse({
    status: 200,
    description: "Return the location.",
    type: LocationDto,
  })
  @ApiResponse({ status: 404, description: "Location not found." })
  async findOne(@Param("id") id: string): Promise<Location> {
    return this.locationsService.findOne(+id);
  }

  @Patch(":id")
  @Version("1")
  @ApiOperation({ summary: "Update a location" })
  @ApiParam({ name: "id", type: "number" })
  @ApiResponse({
    status: 200,
    description: "The location has been successfully updated.",
    type: LocationDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateLocationDto: UpdateLocationDto
  ): Promise<Location> {
    return this.locationsService.update(+id, updateLocationDto);
  }

  @Delete(":id")
  @Version("1")
  @ApiOperation({ summary: "Delete a location" })
  @ApiResponse({
    status: 200,
    description: "The location has been successfully deleted.",
    type: LocationDto,
  })
  @ApiNotFoundResponse({ description: "Location not found." })
  @ApiUnprocessableEntityResponse({
    description: "Cannot delete location because it has child locations.",
  })
  async remove(@Param("id") id: string): Promise<Location> {
    return this.locationsService.remove(+id);
  }
}
