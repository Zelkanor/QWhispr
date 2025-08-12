import 'dart:convert';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:crypto/crypto.dart';

class DeviceFingerprint {
  static final _deviceInfo = DeviceInfoPlugin();

  /// Generate a strong, unique device fingerprint based on platform and hardware info
  static Future<String> getFingerprint() async {
    final components = <String>[];

    // Mobile platforms
    if (defaultTargetPlatform == TargetPlatform.android) {
      final androidInfo = await _deviceInfo.androidInfo;
      components.addAll([
        androidInfo.id,
        androidInfo.board,
        androidInfo.bootloader,
        androidInfo.brand,
        androidInfo.device,
        androidInfo.display,
        androidInfo.fingerprint,
        androidInfo.hardware,
        androidInfo.manufacturer,
        androidInfo.model,
        androidInfo.product,
        androidInfo.serialNumber,
        androidInfo.version.sdkInt.toString(),
        androidInfo.version.release,
      ]);
    } else {
      final iosInfo = await _deviceInfo.iosInfo;
      components.addAll([
        iosInfo.identifierForVendor ?? '',
        iosInfo.utsname.machine,
        iosInfo.utsname.nodename,
        iosInfo.utsname.release,
        iosInfo.utsname.sysname,
        iosInfo.utsname.version,
        iosInfo.name,
        iosInfo.systemName,
        iosInfo.systemVersion,
      ]);
    }

    // Concatenate all components with a delimiter to form a fingerprint seed string
    final combined = components.where((c) => c.isNotEmpty).join('|');

    // Hash with SHA-256 to produce a fixed-length, non-reversible device fingerprint
    final bytes = utf8.encode(combined);
    final digest = sha256.convert(bytes);

    // Return as hex string (64 characters)
    return digest.toString();
  }
}
