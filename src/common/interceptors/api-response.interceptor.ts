import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResponse } from "../interfaces/api-response.interface";

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        return {
          code: response.statusCode,
          message: this.getMessageForStatusCode(response.statusCode),
          data,
        };
      })
    );
  }

  private getMessageForStatusCode(statusCode: number): string {
    switch (statusCode) {
      case 200:
        return "Request successful";
      case 201:
        return "Resource created successfully";
      default:
        return "Request processed successfully";
    }
  }
}
