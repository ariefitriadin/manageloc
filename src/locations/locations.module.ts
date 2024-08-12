import { Logger, Module } from "@nestjs/common";
import { LocationsService } from "./locations.service";
import { LocationsController } from "./locations.controller";
import { PrismaService } from "./prisma.service";

@Module({
  controllers: [LocationsController],
  providers: [LocationsService, PrismaService, Logger],
})
export class LocationsModule {}
