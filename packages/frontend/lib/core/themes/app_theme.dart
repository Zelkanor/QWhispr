import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:frontend/core/themes/app_palette.dart';
import 'package:frontend/core/themes/app_text_theme_extension.dart';

class AppTheme {
  static final dark = ThemeData.dark().copyWith(
    extensions: [_darkAppColors, _darkTextTheme],
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide.none,
      ),
    ),
  );

  static final light = ThemeData.light().copyWith(
    extensions: [_lightAppColors, _textTheme],
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide.none,
      ),
    ),
  );

  static final _lightAppColors = AppColorsExtension(
    primary: Colors.black,
    scaffoldBackgroundColor: Colors.white,
  );

  static final _textTheme = AppTextThemeExtension(
    titleLarge: GoogleFonts.alegreyaSans(
      fontSize: FontSizes.large,
      color: Colors.black,
    ),
    titleMedium: GoogleFonts.alegreyaSans(
      fontSize: FontSizes.medium,
      color: Colors.black,
    ),
    bodyLarge: GoogleFonts.alegreyaSans(
      fontSize: FontSizes.standardUp,
      color: Colors.black,
    ),
    bodyMedium: GoogleFonts.alegreyaSans(
      fontSize: FontSizes.standard,
      color: Colors.black,
    ),
    bodySmall: GoogleFonts.alegreyaSans(
      fontSize: FontSizes.standard,
      color: Colors.black,
    ),
  );

  static final _darkAppColors = AppColorsExtension(
    primary: Colors.white,
    scaffoldBackgroundColor: const Color(0xFF1B202D),
  );

  static final _darkTextTheme = AppTextThemeExtension(
    titleLarge: GoogleFonts.alegreyaSans(
      fontSize: FontSizes.large,
      color: Colors.white,
    ),
    titleMedium: GoogleFonts.alegreyaSans(
      fontSize: FontSizes.medium,
      color: Colors.white,
    ),
    bodyLarge: GoogleFonts.alegreyaSans(
      fontSize: FontSizes.standardUp,
      color: Colors.white,
    ),
    bodyMedium: GoogleFonts.alegreyaSans(
      fontSize: FontSizes.standard,
      color: Colors.white,
    ),
    bodySmall: GoogleFonts.alegreyaSans(
      fontSize: FontSizes.standard,
      color: Colors.white,
    ),
  );
}
