import 'package:flutter/material.dart';
import 'package:frontend/core/themes/theme_extension.dart';

enum SnackBarType { error, success, info }

class CustomSnackbar extends StatefulWidget {
  const CustomSnackbar({
    super.key,
    required this.duration,
    this.type = SnackBarType.info,
    required this.message,
  });
  final Duration duration;
  final SnackBarType type;
  final String message;

  @override
  State<CustomSnackbar> createState() => _CustomSnackbarState();
}

class _CustomSnackbarState extends State<CustomSnackbar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;
  late final Color bgColor;
  late Color iColor;
  late final IconData icon;
  @override
  void initState() {
    super.initState();
    switch (widget.type) {
      case SnackBarType.error:
        bgColor = const Color.fromARGB(255, 214, 87, 69);
        iColor = const Color(0xFFF3CDC8);
        icon = Icons.error;
        break;

      case SnackBarType.success:
        bgColor = const Color(0xFF55B938);
        iColor = const Color(0xFFCCEAC4);
        icon = Icons.check_circle_outline;
        break;
      case SnackBarType.info:
        bgColor = const Color(0xFF5296D5);
        iColor = const Color(0xFFCBE0F3);
        icon = Icons.info_outline;
        break;
    }
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _animation = Tween<double>(begin: 1, end: 0).animate(_controller);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: bgColor,
      height: 40,
      width: 320,
      child: Stack(
        children: [
          Positioned(
            top: 7,
            left: 0,
            right: 0,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(width: 10),
                Icon(icon, size: 25, color: Colors.white),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    overflow: TextOverflow.ellipsis,
                    widget.message,
                    style: context.theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SizedBox(
              height: 5,
              child: AnimatedBuilder(
                animation: _controller,
                builder: (context, animation) {
                  return LinearProgressIndicator(
                    value: _animation.value,
                    color: iColor,
                    backgroundColor: bgColor,
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
