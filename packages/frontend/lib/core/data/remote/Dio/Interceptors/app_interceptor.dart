import 'package:dio/dio.dart';
import 'package:frontend/core/data/local/Flutter_secure_storage/isecure_storage.dart';
import 'package:frontend/features/auth/data/models/auth_response.dart';
import '../../../local/Flutter_secure_storage/secure_storage_variables.dart';

typedef RefreshTokenCallback = Future<AuthResponse> Function();
typedef LogoutCallback = void Function();

class AppInterceptor extends QueuedInterceptorsWrapper {
  final Dio dio;
  final ISecureStorage _secureStorage;
  final RefreshTokenCallback _refreshToken;
  final LogoutCallback _onLogout;
  AppInterceptor({
    required this.dio,
    required ISecureStorage secureStorage,
    required RefreshTokenCallback refreshToken,
    required LogoutCallback onLogout,
  }) : _secureStorage = secureStorage,
       _onLogout = onLogout,
       _refreshToken = refreshToken;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final refreshPaths = ['/auth/refresh', '/auth/logout'];

    if (refreshPaths.contains(options.path)) {
      // For refresh and logout, we must send the Refresh Token.
      final refreshToken = await _secureStorage.read(
        StorageKeys.refreshTokenKey,
      );
      if (refreshToken != null) {
        options.headers['Authorization'] = 'Bearer $refreshToken';
      }
    } else {
      final accessToken = await _secureStorage.read(StorageKeys.accessTokenKey);
      if (accessToken != null) {
        options.headers['Authorization'] = 'Bearer $accessToken';
      }
    }
    return handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      try {
        final refreshToken = await _secureStorage.read(
          StorageKeys.refreshTokenKey,
        );
        if (refreshToken == null) {
          // If no refresh token, reject the request and trigger logout flow
          _onLogout();
          return handler.reject(err);
        }
        // Call the refresh token function passed in the constructor
        final tokens = await _refreshToken();
        // If refresh is successful, save the new token
        await _secureStorage.write(
          StorageKeys.accessTokenKey,
          tokens.accessToken,
        );
        await _secureStorage.write(
          StorageKeys.refreshTokenKey,
          tokens.refreshToken,
        );
        // Retry the original request with the new token
        final options = err.requestOptions;
        options.headers['Authorization'] = 'Bearer ${tokens.accessToken}';
        final response = await dio.fetch(options);
        return handler.resolve(response);
      } catch (e) {
        return handler.reject(err);
      }
    }
    // Handle retry logic for connection timeouts
    if (_shouldRetry(err)) {
      try {
        await Future.delayed(const Duration(seconds: 3));
        final response = await dio.fetch(err.requestOptions);
        return handler.resolve(response);
      } catch (e) {
        return handler.next(err);
      }
    }

    // For all other errors, pass them along
    return handler.next(err);
  }

  bool _shouldRetry(DioException err) {
    return err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout;
  }
}
