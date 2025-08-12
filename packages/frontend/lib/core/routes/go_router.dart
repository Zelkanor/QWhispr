import 'dart:async';
import 'package:flutter/material.dart';
import 'package:frontend/message_page.dart';
import 'package:go_router/go_router.dart';
import 'package:frontend/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:frontend/features/auth/presentation/pages/login_page.dart';
import 'package:frontend/features/auth/presentation/pages/signup_page.dart';

GoRouter createRouter(AuthBloc authBloc) {
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: GoRouterRefreshStream(authBloc.stream),
    redirect: (context, state) async {
      final authState = authBloc.state;
      final location = state.matchedLocation;

      // When the app is starting, the state will be AuthInitial.
      // We don't need to redirect anywhere; just show the initial login page.
      if (authState is AuthInitial) {
        return null;
      }

      // Define public routes that do not require authentication.
      final publicRoutes = ['/login', '/signup'];
      final isGoingToPublicRoute = publicRoutes.contains(location);

      // Handle the authenticated state
      if (authState is Authenticated) {
        return isGoingToPublicRoute ? '/home' : null;
      }

      // Handle the unauthenticated state
      if (authState is Unauthenticated || authState is AuthFailure) {
        return isGoingToPublicRoute ? null : '/login';
      }

      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
      GoRoute(path: '/signup', builder: (_, __) => const SignupPage()),
      GoRoute(path: '/home', builder: (_, __) => const MessagePage()),
    ],
  );
}

class GoRouterRefreshStream extends ChangeNotifier {
  late final StreamSubscription<dynamic> _subscription;
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
