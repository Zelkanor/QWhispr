import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:frontend/core/errors/app_exception.dart';
import 'package:frontend/features/auth/domain/entities/user_entity.dart';
import 'package:frontend/features/auth/domain/usecases/check_auth_status_usecase.dart';
import 'package:frontend/features/auth/domain/usecases/login_use_case.dart';
import 'package:frontend/features/auth/domain/usecases/logout_usecase.dart';
import 'package:frontend/features/auth/domain/usecases/singup_use_case.dart';
part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final SingupUseCase registerUseCase;
  final LoginUseCase loginUseCase;
  final LogoutUsecase logoutUsecase;
  final CheckAuthStatusUsecase getUser;
  AuthBloc({
    required this.registerUseCase,
    required this.loginUseCase,
    required this.logoutUsecase,
    required this.getUser,
  }) : super(AuthInitial()) {
    on<AppStarted>(_onAppStarted);
    on<SignupEvent>(_onRegister);
    on<LoginEvent>(_onLogin);
    on<LogoutEvent>(_onLogout);
  }

  /// Handles app startup to check for a persistent session.
  Future<void> _onAppStarted(AppStarted event, Emitter<AuthState> emit) async {
    try {
      final user = await getUser();
      if (user != null) {
        emit(Authenticated(user));
      } else {
        emit(const Unauthenticated());
      }
    } catch (_) {
      emit(const Unauthenticated());
    }
  }

  Future<void> _onRegister(SignupEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await registerUseCase(event.username, event.email, event.password);
      // After signup, user must login. Transition to Unauthenticated with a success message.
      emit(
        const Unauthenticated(
          message: 'Registration successful! Please log in.',
        ),
      );
    } on AppException catch (e) {
      emit(AuthFailure(e));
    }
  }

  Future<void> _onLogin(LoginEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final user = await loginUseCase(event.email, event.password);
      emit(Authenticated(user));
    } on AppException catch (e) {
      emit(AuthFailure(e));
    }
  }

  Future<void> _onLogout(LogoutEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      // Clears tokens and session
      await logoutUsecase();
    } finally {
      // Even if logout fails, we'll force the state to Unauthenticated.
      emit(Unauthenticated(message: 'You have been logged out.'));
    }
  }
}
