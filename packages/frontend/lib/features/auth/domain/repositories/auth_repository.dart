import 'package:frontend/features/auth/data/models/auth_response.dart';
import 'package:frontend/features/auth/domain/entities/user_entity.dart';

abstract class AuthRepository {
  Future<UserEntity> login({required String email, required String password});
  Future<void> signup({
    required String username,
    required String email,
    required String password,
  });
  Future<UserEntity?> getLoggedInUser();
  Future<void> logout();
  Future<AuthResponse> refreshAuthToken();
}
