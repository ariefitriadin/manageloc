export const ApiProperty = jest.fn();
export const ApiTags = jest.fn();
export const ApiOperation = jest.fn();
export const ApiResponse = jest.fn();
export const ApiParam = jest.fn();
export const ApiQuery = jest.fn();
export const ApiBody = jest.fn();

export const SwaggerModule = {
  createDocument: jest.fn(),
  setup: jest.fn(),
};

export const DocumentBuilder = jest.fn(() => ({
  setTitle: jest.fn().mockReturnThis(),
  setDescription: jest.fn().mockReturnThis(),
  setVersion: jest.fn().mockReturnThis(),
  addTag: jest.fn().mockReturnThis(),
  build: jest.fn(),
}));
