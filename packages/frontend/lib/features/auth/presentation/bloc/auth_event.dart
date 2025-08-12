part of 'auth_bloc.dart';

@immutable
sealed class AuthEvent {
  const AuthEvent();
}

// Fired when the app starts to check for existing session.
class AppStarted extends AuthEvent {}

// Fired when the user attempts to sign up.
class SignupEvent extends AuthEvent {
  final String username;
  final String email;
  final String password;

  const SignupEvent({
    required this.username,
    required this.email,
    required this.password,
  });
}

// Fired when the user attempts to log in.
class LoginEvent extends AuthEvent {
  final String email;
  final String password;

  const LoginEvent({required this.email, required this.password});
}

// Fired when the user taps the logout button.
class LogoutEvent extends AuthEvent {}
