import 'package:flutter/material.dart';

class CustomInputField extends StatelessWidget {
  const CustomInputField({
    required this.controller,
    this.hintText,
    super.key,
    this.maxLength,
    this.keyboardType,
    this.prefix,
    this.prefixIcon,
    this.suffix,
    this.suffixIcon,
    this.validator,
    this.autovalidateMode,
    this.readOnly = false,
    this.isLoading = false,
    this.isSubmitted = false,
    this.fillColor = Colors.white,
    this.fill,
  });
  final TextEditingController controller;
  final String? hintText;
  final int? maxLength;
  final TextInputType? keyboardType;
  final Widget? prefix;
  final Widget? prefixIcon;
  final Widget? suffix;
  final Widget? suffixIcon;
  final String? Function(String?)? validator;
  final AutovalidateMode? autovalidateMode;
  final bool readOnly;
  final bool isLoading;
  final bool isSubmitted;
  final Color fillColor;
  final bool? fill;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      readOnly: readOnly,
      keyboardType: keyboardType,
      maxLength: maxLength,
      validator: validator,
      autovalidateMode:
          autovalidateMode ??
          (!isSubmitted
              ? AutovalidateMode.disabled
              : AutovalidateMode.onUserInteraction),
      decoration: InputDecoration(
        filled: fill ?? isLoading,
        fillColor: fillColor,
        counterText: "",
        hintText: hintText,
        prefix: prefix,
        prefixIcon: prefixIcon,
        suffixIcon: suffixIcon,
      ),
    );
  }
}
