import 'package:frontend/features/auth/domain/entities/user_entity.dart';

class AuthEntity {
  final UserEntity user;
  final String accessToken;
  final String refreshToken;

  const AuthEntity({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });
}
