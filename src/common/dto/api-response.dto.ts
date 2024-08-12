import { ApiProperty } from "@nestjs/swagger";

export class ApiResponseDto<T> {
  @ApiProperty()
  code: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T;
}
