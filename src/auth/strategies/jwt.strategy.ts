import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'jsonwebtoken';
import { AuthService } from 'src/auth/auth.service';

// Payload emitido en AuthService.getJwtToken: además del `id`, lleva `sid`
// (id de la sesión única activa) para poder invalidar tokens de sesiones
// reemplazadas/cerradas sin esperar su expiración natural.
type AppJwtPayload = JwtPayload & { id: string; sid?: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // rawTokken: ExtractJwt.fromHeader('token')
    });
  }

  // assign user to context
  async validate(payload: AppJwtPayload) {
    const { id, sid } = payload;
    const user = await this.authService.userById(id);

    // Sesión única: si el `sid` del token no coincide con la sesión activa
    // guardada (fue reemplazada por otro login o cerrada por logout), el
    // token deja de ser válido aunque su firma/expiración sigan vigentes.
    if (!sid || (user as { activeSessionId?: string | null }).activeSessionId !== sid) {
      throw new UnauthorizedException('Sesión inválida o cerrada');
    }

    return user;
  }
}
