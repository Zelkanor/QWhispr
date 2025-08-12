import 'package:flutter/material.dart';
import 'package:frontend/core/themes/app_palette.dart';
import 'package:frontend/core/themes/theme_extension.dart';

class ChatPage extends StatelessWidget {
  const ChatPage({super.key});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        appBar: AppBar(
          title: Row(
            children: [
              const CircleAvatar(
                radius: 20,
                backgroundImage: NetworkImage(
                  'https://placehold.co/600x400/png',
                ),
              ),
              const SizedBox(width: 10),
              Text('Chat', style: context.theme.textTheme.titleMedium),
            ],
          ),
          backgroundColor: Colors.transparent,
          elevation: 0,
          actions: [
            IconButton(icon: const Icon(Icons.search), onPressed: () {}),
          ],
        ),
        body: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  _buildReceivedMessage(context),
                  _buildSentMessage(context, 'Hello! How are you?'),
                  _buildReceivedMessage(context),
                  _buildSentMessage(context, 'I am fine, thank you!'),
                  _buildReceivedMessage(context),
                  _buildSentMessage(context, 'What about you?'),
                  _buildReceivedMessage(context),
                  _buildSentMessage(context, 'Doing great!'),
                ],
              ),
            ),
            _buildMessageInput(),
          ],
        ),
      ),
    );
  }
}

Widget _buildReceivedMessage(BuildContext context) {
  return Align(
    alignment: Alignment.centerLeft,
    child: Container(
      margin: const EdgeInsets.only(right: 30, top: 5, bottom: 5),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppPalette.receiverMessage,
        borderRadius: BorderRadius.circular(15),
      ),
      child: Text('message', style: context.theme.textTheme.bodyMedium),
    ),
  );
}

Widget _buildSentMessage(BuildContext context, String message) {
  return Align(
    alignment: Alignment.centerRight,
    child: Container(
      margin: const EdgeInsets.only(left: 30, top: 5, bottom: 5),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppPalette.senderMessage,
        borderRadius: BorderRadius.circular(15),
      ),
      child: Text(message, style: context.theme.textTheme.bodyMedium),
    ),
  );
}

Widget _buildMessageInput() {
  return Container(
    decoration: BoxDecoration(
      color: AppPalette.sentMessageInput,
      borderRadius: BorderRadius.circular(25),
    ),
    margin: const EdgeInsets.all(25),
    padding: const EdgeInsets.symmetric(horizontal: 15),
    child: Row(
      children: [
        GestureDetector(
          child: const Icon(Icons.camera_alt, color: Colors.grey),
          onTap: () {
            // Handle camera icon tap
          },
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: TextField(
            decoration: InputDecoration(
              hintText: 'Type a message',
              border: InputBorder.none,
              hintStyle: TextStyle(color: Colors.grey),
            ),
          ),
        ),
        const SizedBox(width: 10),
        GestureDetector(
          child: const Icon(Icons.send, color: Colors.grey),
          onTap: () {
            // Handle send icon tap
          },
        ),
      ],
    ),
  );
}
