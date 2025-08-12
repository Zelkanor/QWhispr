import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:frontend/core/errors/app_exception.dart';
import 'package:frontend/core/data/remote/api_response.dart';
import 'package:frontend/features/auth/data/models/auth_response.dart';
import 'package:frontend/features/auth/data/models/user_model.dart';
import 'package:frontend/features/auth/domain/entities/auth_token_entity.dart';

enum HttpMethod { get, post, put, delete }

abstract class IAuthRemoteDatasource {
  Future<AuthResponse> login({
    required String email,
    required String password,
    required String deviceFingerprint,
  });

  Future<void> signup({
    required String email,
    required String password,
    required String username,
    required String deviceFingerprint,
  });

  Future<AuthEntity> refreshAuthToken();
  Future<UserModel?> getLoggedInUser();
  Future<void> logout();
}

final class AuthRemoteDatasourceImpl implements IAuthRemoteDatasource {
  final Dio _dio;
  const AuthRemoteDatasourceImpl(Dio dio) : _dio = dio;

  Future<T> _request<T>(
    String path, {
    required HttpMethod method,
    Map<String, dynamic>? data,
    T Function(dynamic json)? fromJson,
  }) async {
    try {
      Response response;
      switch (method) {
        case HttpMethod.post:
          response = await _dio.post(path, data: data);
          break;
        case HttpMethod.get:
          response = await _dio.get(path, queryParameters: data);
          break;
        // Add cases for put, delete etc. as needed
        default:
          throw Exception('Unsupported HTTP method: $method');
      }
      final apiResponse = ApiResponse.fromJson(response.data, fromJson);

      if (apiResponse.success && apiResponse.data != null) {
        return apiResponse.data! as T;
      } else {
        throw ApiException(
          code: apiResponse.error!.code,
          message: apiResponse.error!.message,
          details: apiResponse.error!.details,
        );
      }
    } on DioException catch (e) {
      throw handleDioException(e);
    } catch (e, st) {
      if (e is ApiException) rethrow;
      debugPrint('--- UNEXPECTED PARSING ERROR ---');
      debugPrint('Error: $e');
      debugPrint('Stacktrace: $st');
      throw const UnexpectedException();
    }
  }

  @override
  Future<AuthResponse> login({
    required String email,
    required String password,
    required String deviceFingerprint,
  }) async {
    return _request<AuthResponse>(
      '/auth/login',
      method: HttpMethod.post,
      data: {
        'email': email,
        'password': password,
        'deviceFingerprint': deviceFingerprint,
      },
      fromJson: (json) => AuthResponse.fromJson(json),
    );
  }

  @override
  Future<void> signup({
    required String email,
    required String password,
    required String username,
    required String deviceFingerprint,
  }) async {
    return _request<void>(
      '/auth/register',
      method: HttpMethod.post,
      data: {
        'email': email,
        'password': password,
        'username': username,
        'deviceFingerprint': deviceFingerprint,
      },
      fromJson: (json) => UserModel.fromJson(json['user']),
    );
  }

  @override
  Future<AuthResponse> refreshAuthToken() {
    return _request<AuthResponse>(
      '/auth/refresh',
      method: HttpMethod.post,
      data: {},
      fromJson: (json) => AuthResponse.fromJson(json['tokens']),
    );
  }

  @override
  Future<UserModel?> getLoggedInUser() async {
    return _request<UserModel?>(
      '/auth/user',
      method: HttpMethod.get,
      fromJson: (json) => UserModel.fromJson(json['user']),
    );
  }

  @override
  Future<void> logout() async {
    return _request<void>('/auth/logout', method: HttpMethod.post, data: {});
  }
}
