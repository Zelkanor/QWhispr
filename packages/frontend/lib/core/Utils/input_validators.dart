class InputValidators {
  const InputValidators();

  static String? nameValidator(String? value) {
    if (value!.isEmpty) {
      return "Name is required";
    }
    return null;
  }

  static String? emailValidator(String? value) {
    if (value!.isEmpty) {
      return "Email is required";
    }
    final bool emailValid = RegExp(
      r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+",
    ).hasMatch(value);
    if (!emailValid) {
      return "Invalid Email";
    }
    return null;
  }

  static String? phoneNoValidator(String? value) {
    if (value!.isEmpty) {
      return "Phone number is required";
    }
    if (value.length != 10) {
      return "Phone number is invalid";
    }
    return null;
  }
}
