import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { AuthResponse } from './dto/response/auth-response.dto';
import { LoginInput } from './dto/inputs/login.input';
import { CurrentToken } from 'src/common/decorators';
import { ContextUser } from 'src/common/entities/ContextUser';
import { ChangePasswordInput } from './dto/inputs/change-password.input';

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

  // @Query(() => [Auth], { name: 'authGetUser' })
  // findAll() {
  //   return this.authService.findAll();
  // }
}
