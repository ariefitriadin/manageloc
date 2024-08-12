import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { VersioningType, Logger } from "@nestjs/common";
import { ApiResponseInterceptor } from "./common/interceptors/api-response.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug"],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: "api/v",
  });
  app.useLogger(new Logger());
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle("Building Locations API")
    .setDescription("The Building Locations API")
    .setVersion("1.0")
    .addTag("locations")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/v1/documentation", app, document);

  const configService = app.get(ConfigService);
  const port = configService.get("PORT");

  await app.listen(port || 3000);
  Logger.log(
    `[NestApplication] Nest application is running on port ${port || 3000}`
  );
}

if (require.main === module) {
  bootstrap();
}
