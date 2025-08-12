import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:frontend/core/data/remote/api_response.dart';

sealed class AppException implements Exception {
  final String message;
  const AppException(this.message);
}

// For errors coming from backend API
class ApiException extends AppException {
  final String code;
  final Map<String, dynamic>? details;
  const ApiException({
    required this.code,
    required String message,
    this.details,
  }) : super(message);
}

// For network-related errors (e.g., no internet, timeout)
class NetworkException extends AppException {
  const NetworkException(super.message);
}

class UnexpectedException extends AppException {
  const UnexpectedException() : super('An unexpected error occurred.');
}

AppException handleDioException(DioException e) {
  // Handle timeouts, no internet, etc.
  if (e.type == DioExceptionType.connectionTimeout ||
      e.type == DioExceptionType.sendTimeout ||
      e.type == DioExceptionType.receiveTimeout ||
      e.type == DioExceptionType.connectionError) {
    debugPrint('Network error: ${e.message}');
    return NetworkException('Connection error: ${e.message}');
  }

  // Handle errors where the server responded with an error message
  if (e.response != null && e.response?.data is Map<String, dynamic>) {
    try {
      final apiResponse = ApiResponse.fromJson(e.response!.data, null);
      if (apiResponse.error != null) {
        return ApiException(
          code: apiResponse.error!.code,
          message: apiResponse.error!.message,
          details: apiResponse.error!.details,
        );
      }
    } catch (e) {
      debugPrint('Failed to parse API error response: $e');
      return const UnexpectedException();
    }
  }
  return UnexpectedException();
}
