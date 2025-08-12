import 'package:frontend/features/auth/domain/repositories/auth_repository.dart';

class LogoutUsecase {
  final AuthRepository _authRepository;

  LogoutUsecase(this._authRepository);

  Future<void> call() async {
    await _authRepository.logout();
  }
}
