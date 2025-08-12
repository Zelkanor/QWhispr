import 'package:frontend/features/auth/domain/repositories/auth_repository.dart';

class SingupUseCase {
  final AuthRepository _authRepository;
  const SingupUseCase(this._authRepository);
  Future<void> call(String username, String email, String password) {
    return _authRepository.signup(
      username: username,
      email: email,
      password: password,
    );
  }
}
