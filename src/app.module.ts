import { Module, Logger } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LocationsModule } from "./locations/locations.module";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), LocationsModule],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
