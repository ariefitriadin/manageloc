import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "../src/locations/prisma.service";

describe("LocationsController (e2e)", () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prismaService.location.deleteMany();
    await app.close();
  });

  it("/locations (POST)", async () => {
    const newLocation = {
      name: "Test Location",
      code: "TEST001",
      type: "BUILDING",
      level: 1,
    };

    const response = await request(app.getHttpServer())
      .post("/locations")
      .send(newLocation)
      .expect(201);

    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(newLocation.name);
  });

  it("/locations (GET)", async () => {
    const response = await request(app.getHttpServer())
      .get("/locations")
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it("/locations/:id (GET)", async () => {
    // First, create a location
    const newLocation = await prismaService.location.create({
      data: {
        name: "Get Test Location",
        code: "GET001",
        type: "BUILDING",
        level: 1,
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/locations/${newLocation.id}`)
      .expect(200);

    expect(response.body.id).toBe(newLocation.id);
    expect(response.body.name).toBe(newLocation.name);
  });

  it("/locations/:id (PATCH)", async () => {
    // First, create a location
    const newLocation = await prismaService.location.create({
      data: {
        name: "Update Test Location",
        code: "UPDATE001",
        type: "BUILDING",
        level: 1,
      },
    });

    const updatedData = {
      name: "Updated Location Name",
    };

    const response = await request(app.getHttpServer())
      .patch(`/locations/${newLocation.id}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.id).toBe(newLocation.id);
    expect(response.body.name).toBe(updatedData.name);
  });

  it("/locations/:id (DELETE)", async () => {
    // First, create a location
    const newLocation = await prismaService.location.create({
      data: {
        name: "Delete Test Location",
        code: "DELETE001",
        type: "BUILDING",
        level: 1,
      },
    });

    await request(app.getHttpServer())
      .delete(`/locations/${newLocation.id}`)
      .expect(200);

    // Verify the location has been deleted
    const deletedLocation = await prismaService.location.findUnique({
      where: { id: newLocation.id },
    });
    expect(deletedLocation).toBeNull();
  });
});
