import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:frontend/core/data/local/Flutter_secure_storage/isecure_storage.dart';
import 'package:frontend/core/data/local/Flutter_secure_storage/secure_storage_variables.dart';

final class SecureStorage implements ISecureStorage {
  final FlutterSecureStorage _storage;
  const SecureStorage(this._storage);
  @override
  Future<void> delete(String key) async {
    return await _storage.delete(key: key);
  }

  @override
  Future<String?> read(String key) async {
    return await _storage.read(key: key);
  }

  @override
  Future<void> write(String key, String value) async {
    return await _storage.write(key: key, value: value);
  }

  @override
  Future<void> deleteAllTokens() async {
    await _storage.delete(key: StorageKeys.accessTokenKey);
    await _storage.delete(key: StorageKeys.refreshTokenKey);
  }
}
