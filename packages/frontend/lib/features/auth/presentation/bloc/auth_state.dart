part of 'auth_bloc.dart';

@immutable
sealed class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

/// The initial state before any authentication check has been made.
final class AuthInitial extends AuthState {}

// State indicating an authentication process is in progress (e.g., login, signup).
final class AuthLoading extends AuthState {}

final class AuthFailure extends AuthState {
  final AppException exception;
  const AuthFailure(this.exception);

  @override
  List<Object?> get props => [exception];
}

/// Represents the state where the user is successfully logged in.
/// It holds the user data for easy access throughout the app.
final class Authenticated extends AuthState {
  final UserEntity user;
  const Authenticated(this.user);

  @override
  List<Object?> get props => [user];
}

/// Represents the state where the user is not logged in or has logged out.
final class Unauthenticated extends AuthState {
  final String? message;
  const Unauthenticated({this.message});

  @override
  List<Object?> get props => [message];
}
