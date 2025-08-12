import 'package:dio/dio.dart';
import 'package:talker_dio_logger/talker_dio_logger.dart';
import 'package:talker_flutter/talker_flutter.dart';
import '../../../di/service_locatior.dart';

class DioFactory {
  static const String _baseUrl = 'http://10.0.2.2:3000/api/v1';

  static Dio createDio() {
    final dio = Dio(BaseOptions(baseUrl: _baseUrl));
    dio.interceptors.add(
      TalkerDioLogger(
        talker: sl<Talker>(),
        settings: TalkerDioLoggerSettings(
          printResponseData: true,
          printRequestHeaders: true,
          printResponseMessage: true,
          printRequestExtra: true,
          requestPen: AnsiPen()..blue(),
          responsePen: AnsiPen()..green(),
          errorPen: AnsiPen()..red(),
        ),
      ),
    );
    return dio;
  }
}
