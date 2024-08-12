import { ApiProperty } from "@nestjs/swagger";
import { LocationType } from "@prisma/client";

export class LocationDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ enum: LocationType })
  type: LocationType;

  @ApiProperty({ required: false, nullable: true })
  parentId: number | null;

  @ApiProperty()
  level: number;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty({ required: false, nullable: true })
  area: number | null;

  @ApiProperty({ required: false, nullable: true })
  x: number | null;

  @ApiProperty({ required: false, nullable: true })
  y: number | null;

  @ApiProperty({ required: false, nullable: true })
  z: number | null;
}

export class CreateLocationDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ enum: LocationType })
  type: LocationType;

  @ApiProperty({ required: false })
  parentId?: number;

  @ApiProperty()
  level: number;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  area?: number;

  @ApiProperty({ required: false })
  x?: number;

  @ApiProperty({ required: false })
  y?: number;

  @ApiProperty({ required: false })
  z?: number;
}

export class UpdateLocationDto extends CreateLocationDto {}
