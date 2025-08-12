import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:frontend/core/data/remote/Dio/Interceptors/app_interceptor.dart';
import 'package:frontend/core/data/remote/Dio/dio_factory.dart';
import 'package:get_it/get_it.dart';
import 'package:frontend/core/data/local/Flutter_secure_storage/isecure_storage.dart';
import 'package:frontend/core/data/local/Flutter_secure_storage/secure_storage.dart';
import 'package:frontend/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:frontend/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:frontend/features/auth/domain/repositories/auth_repository.dart';
import 'package:frontend/features/auth/domain/usecases/check_auth_status_usecase.dart';
import 'package:frontend/features/auth/domain/usecases/login_use_case.dart';
import 'package:frontend/features/auth/domain/usecases/logout_usecase.dart';
import 'package:frontend/features/auth/domain/usecases/singup_use_case.dart';
import 'package:frontend/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:talker_flutter/talker_flutter.dart';

final sl = GetIt.instance;

Future<void> initDependencies() async {
  // --- CORE & EXTERNAL ---
  sl.registerLazySingleton<Talker>(
    () => TalkerFlutter.init(
      settings: TalkerSettings(useConsoleLogs: kDebugMode),
    ),
  );
  sl.registerSingleton<FlutterSecureStorage>(
    const FlutterSecureStorage(
      aOptions: AndroidOptions(encryptedSharedPreferences: true),
      iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
    ),
  );
  sl.registerSingleton<ISecureStorage>(
    SecureStorage(sl<FlutterSecureStorage>()),
  );

  // --- API CLIENTS (DIO) ---
  sl.registerLazySingleton<Dio>(() => DioFactory.createDio());
  sl.registerLazySingleton<Dio>(
    () => DioFactory.createDio(),
    instanceName: 'RefreshTokenDio',
  );

  // --- DATA LAYER ---
  sl.registerLazySingleton<IAuthRemoteDatasource>(
    () => AuthRemoteDatasourceImpl(sl<Dio>()),
  );
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl<IAuthRemoteDatasource>(),
      secureStorage: sl<ISecureStorage>(),
      refreshTokenDio: sl<Dio>(instanceName: 'RefreshTokenDio'),
    ),
  );

  // --- USE CASES & BLOCS ---
  sl.registerLazySingleton<LoginUseCase>(() => LoginUseCase(sl()));
  sl.registerLazySingleton<SingupUseCase>(() => SingupUseCase(sl()));
  sl.registerLazySingleton<LogoutUsecase>(() => LogoutUsecase(sl()));
  sl.registerLazySingleton<CheckAuthStatusUsecase>(
    () => CheckAuthStatusUsecase(sl<AuthRepository>()),
  );
  sl.registerFactory(
    () => AuthBloc(
      getUser: sl<CheckAuthStatusUsecase>(),
      logoutUsecase: sl<LogoutUsecase>(),
      registerUseCase: sl<SingupUseCase>(),
      loginUseCase: sl<LoginUseCase>(),
    ),
  );

  // --- FINAL CONFIGURATION STEP ---
  sl<Dio>().interceptors.add(
    AppInterceptor(
      dio: sl(),
      secureStorage: sl(),
      refreshToken: sl<AuthRepository>().refreshAuthToken,
      onLogout: () => sl<AuthBloc>().add(LogoutEvent()),
    ),
  );
}
