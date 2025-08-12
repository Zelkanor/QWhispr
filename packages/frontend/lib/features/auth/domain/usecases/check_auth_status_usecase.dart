import 'package:frontend/features/auth/domain/entities/user_entity.dart';
import 'package:frontend/features/auth/domain/repositories/auth_repository.dart';

class CheckAuthStatusUsecase {
  final AuthRepository _authRepository;
  const CheckAuthStatusUsecase(this._authRepository);
  Future<UserEntity?> call() {
    return _authRepository.getLoggedInUser();
  }
}
