import {
  Injectable,
  Logger,
  OnModuleInit,
  INestApplication,
} from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";

const logQuery = isQueryLoggingEnabled()
  ? ["query", "info", "warn", "error"]
  : ["info", "warn", "error"];
const extendedClient = new PrismaClient({
  log: logQuery as unknown as Prisma.LogDefinition[],
}).$extends({
  query: {
    $allModels: {
      $allOperations: async ({ operation, model, args, query }) => {
        const start = Date.now();
        const result = await query(args);
        const end = Date.now();
        Logger.log(`Query ${model}.${operation} took ${end - start}ms`);
        return result;
      },
    },
  },
});

export function isQueryLoggingEnabled(): boolean {
  return process.env.NODE_ENV?.includes("querylog") ?? false;
}

export function getLogLevels(): Prisma.LogDefinition[] {
  const baseLogLevels: Prisma.LogDefinition[] = [
    { emit: "stdout", level: "warn" },
    { emit: "stdout", level: "error" },
  ];

  if (process.env.NODE_ENV?.includes("production")) {
    return baseLogLevels;
  }

  const devLogLevels: Prisma.LogDefinition[] = [
    { emit: "stdout", level: "info" },
    ...baseLogLevels,
  ];

  if (isQueryLoggingEnabled()) {
    return [{ emit: "stdout", level: "query" }, ...devLogLevels];
  }

  return devLogLevels;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  readonly extendedClient = extendedClient;
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const logLevels = getLogLevels();

    super({
      log: logLevels,
    });

    this.logger.log(`Query logging enabled: ${isQueryLoggingEnabled()}`);

    if (isQueryLoggingEnabled()) {
      this.extendedClient = extendedClient;
    }

    return new Proxy(this, {
      get: (target: any, key: string) =>
        Reflect.get(key in extendedClient ? extendedClient : target, key),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    async function waitForAppClose() {
      await app.close();
    }
    process.on("exit", waitForAppClose);
    process.on("beforeExit", waitForAppClose);
    process.on("SIGINT", waitForAppClose);
    process.on("SIGTERM", waitForAppClose);
    process.on("SIGUSR2", waitForAppClose);
  }
}
