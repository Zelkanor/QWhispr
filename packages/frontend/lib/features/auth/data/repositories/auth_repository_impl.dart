import 'package:dio/dio.dart';
import 'package:frontend/core/Utils/device_fingerprint.dart';
import 'package:frontend/core/data/local/Flutter_secure_storage/secure_storage_variables.dart';
import 'package:frontend/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:frontend/features/auth/data/models/auth_response.dart';
import 'package:frontend/features/auth/domain/entities/user_entity.dart';
import 'package:frontend/features/auth/domain/repositories/auth_repository.dart';
import '../../../../core/data/local/Flutter_secure_storage/isecure_storage.dart';

class AuthRepositoryImpl implements AuthRepository {
  final IAuthRemoteDatasource _authRemoteDatasource;
  final ISecureStorage _secureStorage;
  final Dio _refreshTokenDio;
  const AuthRepositoryImpl({
    required IAuthRemoteDatasource remoteDataSource,
    required ISecureStorage secureStorage,
    required Dio refreshTokenDio,
  }) : _authRemoteDatasource = remoteDataSource,
       _secureStorage = secureStorage,
       _refreshTokenDio = refreshTokenDio;

  @override
  Future<UserEntity> login({
    required String email,
    required String password,
  }) async {
    final deviceFingerprint = await DeviceFingerprint.getFingerprint();
    final authResponse = await _authRemoteDatasource.login(
      email: email,
      password: password,
      deviceFingerprint: deviceFingerprint,
    );

    // 2. Save the tokens
    await _secureStorage.write(
      StorageKeys.accessTokenKey,
      authResponse.accessToken,
    );
    await _secureStorage.write(
      StorageKeys.refreshTokenKey,
      authResponse.refreshToken,
    );

    return authResponse.user;
  }

  @override
  Future<void> signup({
    required String username,
    required String email,
    required String password,
  }) async {
    String deviceFingerprint = await DeviceFingerprint.getFingerprint();
    return await _authRemoteDatasource.signup(
      username: username,
      email: email,
      password: password,
      deviceFingerprint: deviceFingerprint,
    );
  }

  @override
  Future<UserEntity?> getLoggedInUser() async {
    return await _authRemoteDatasource.getLoggedInUser();
  }

  @override
  Future<void> logout() async {
    final refreshToken = await _secureStorage.read(StorageKeys.refreshTokenKey);
    if (refreshToken != null) {
      try {
        await _authRemoteDatasource.logout();
        ;
      } catch (e) {
        // Ignore errors on logout, as the goal is to clear local data regardless
      }
    }
    await _secureStorage.deleteAllTokens();
  }

  @override
  Future<AuthResponse> refreshAuthToken() async {
    final tempDataSource = AuthRemoteDatasourceImpl(_refreshTokenDio);
    return await tempDataSource.refreshAuthToken();
  }
}
