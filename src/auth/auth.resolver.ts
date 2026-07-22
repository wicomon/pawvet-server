import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { AuthResponse } from './dto/response/auth-response.dto';
import { LoginInput } from './dto/inputs/login.input';
import { CurrentToken, CurrentUser } from 'src/common/decorators';
import { ContextUser } from 'src/common/entities/ContextUser';
import { ChangePasswordInput } from './dto/inputs/change-password.input';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Mutation(() => AuthResponse, { name: 'authLogin' })
  login(@Args('loginInput') loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }

  @Query(() => String, { name: 'authValidateToken' })
  validateToken(@CurrentToken() token: string) {
    return this.authService.validateToken(token);
  }

  @Query(() => ContextUser, { name: 'authUserInfo' })
  getUser(@CurrentToken() token: string) {
    return this.authService.getUserInfo(token);
  }

  @Mutation(() => Boolean, { name: 'authChangePassword' })
  changePassword(
    @CurrentToken() token: string,
    @Args('changePasswordInput') changePasswordInput: ChangePasswordInput,
  ) {
    return this.authService.changePassword(token, changePasswordInput);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean, { name: 'authLogout' })
  logout(@CurrentUser() user: ContextUser) {
    return this.authService.logout(user.id);
  }

  // @Query(() => [Auth], { name: 'authGetUser' })
  // findAll() {
  //   return this.authService.findAll();
  // }
}
