import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Extrai o usuário autenticado (com officeId) já anexado pelo JwtAuthGuard
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
