import 'package:flutter/material.dart';

extension ThemeGetter on BuildContext {
  ThemeData get theme => Theme.of(this);
}

extension ThemeContext on BuildContext {
  bool get isDarkMode => theme.brightness == Brightness.dark;
  bool get isLightMode => theme.brightness == Brightness.light;
}
