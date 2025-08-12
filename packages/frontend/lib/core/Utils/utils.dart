import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:frontend/core/common/widgets/custom_snackbar.dart';

class Utils {
  const Utils._();

  static String formatTimeMain(String dateTime) {
    final time = DateTime.parse(dateTime);
    final dateFormatter = DateFormat('d MMM yyyy, HH:mm');
    return dateFormatter.format(time);
  }

  static void displaySnackBar(
    BuildContext context,
    String message, {
    SnackBarType type = SnackBarType.info,
  }) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        duration: const Duration(seconds: 4),
        padding: const EdgeInsets.all(0),
        content: CustomSnackbar(
          duration: const Duration(seconds: 4),
          message: message,
          type: type,
        ),
      ),
    );
  }
}
