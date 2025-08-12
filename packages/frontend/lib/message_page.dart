import 'package:flutter/material.dart';
import 'package:frontend/core/themes/app_palette.dart';
import 'package:frontend/core/themes/theme_extension.dart';

class MessagePage extends StatelessWidget {
  const MessagePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Messages', style: context.theme.textTheme.titleLarge),
        centerTitle: false,
        backgroundColor: Colors.transparent,
        elevation: 0,
        toolbarHeight: 70,
        actions: [IconButton(onPressed: () {}, icon: const Icon(Icons.search))],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 15.0),
            child: Text('Recent', style: context.theme.textTheme.bodySmall),
          ),
          Container(
            height: 100,
            padding: const EdgeInsets.all(5),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: 10,
              itemBuilder: (context, index) => _buildRecentContact(context),
            ),
          ),
          const SizedBox(height: 10),
          Expanded(
            child: Container(
              decoration: const BoxDecoration(
                color: AppPalette.messageListPage,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(50),
                  topRight: Radius.circular(50),
                ),
              ),
              child: ListView.builder(
                itemCount: 10,
                itemBuilder: (context, index) => _buildMessageTile(
                  context,
                  'Name $index',
                  'This is a sample message for contact $index',
                  '12:${index.toString().padLeft(2, '0')} PM',
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

Widget _buildMessageTile(
  BuildContext context,
  String name,
  String message,
  String time,
) {
  return ListTile(
    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
    leading: const CircleAvatar(
      radius: 30,
      backgroundImage: NetworkImage('https://placehold.co/600x400/png'),
    ),
    title: Text(
      name,
      style: context.theme.textTheme.bodyMedium!.copyWith(
        fontWeight: FontWeight.bold,
      ),
    ),
    subtitle: Text(
      message,
      style: context.theme.textTheme.bodyMedium!.copyWith(color: Colors.grey),
      overflow: TextOverflow.ellipsis,
    ),
    trailing: Text(
      time,
      style: context.theme.textTheme.bodySmall!.copyWith(color: Colors.grey),
    ),
  );
}

Widget _buildRecentContact(BuildContext context) {
  return Padding(
    padding: const EdgeInsets.symmetric(horizontal: 10),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const CircleAvatar(
          radius: 30,
          backgroundImage: NetworkImage('https://placehold.co/600x400/png'),
        ),
        const SizedBox(height: 5),
        Text('time', style: context.theme.textTheme.bodyMedium!),
      ],
    ),
  );
}
