import 'package:frontend/features/auth/data/models/user_model.dart';
import 'package:frontend/features/auth/domain/entities/auth_token_entity.dart';

class AuthResponse extends AuthEntity {
  const AuthResponse({
    required super.user,
    required super.accessToken,
    required super.refreshToken,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    final tokensData = json['tokens'] as Map<String, dynamic>;
    return AuthResponse(
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      accessToken: tokensData['accessToken'] as String,
      refreshToken: tokensData['refreshToken'] as String,
    );
  }
}
