abstract interface class ISecureStorage {
  /// Reads a value from secure storage.
  Future<String?> read(String key);

  //Writes a value to secure storage.
  Future<void> write(String key, String value);

  //Deletes a value from secure storage.
  Future<void> delete(String key);

  //Deletes all tokens from secure storage.
  Future<void> deleteAllTokens();
}
