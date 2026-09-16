import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

import { FaPaperclip} from 'react-icons/fa6';
import { FaSearch} from 'react-icons/fa';
import MessagePreview from '../../components/common/MessagePreview';
import EmptyState from '../../components/common/EmptyState';

const Messages = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  const mockMessages = [
    {
      id: 1,
      senderId: 2,
      senderName: 'Dr. Sarah Mitchell',
      senderAvatar: 'SM',
      content: "Hi! I'm available for the session tomorrow at 2 PM.",
      timestamp: '2024-01-19T14:30:00',
      unread: true,
    },
    {
      id: 2,
      senderId: 3,
      senderName: 'James Rodriguez',
      senderAvatar: 'JR',
      content: "Great! See you on Thursday.",
      timestamp: '2024-01-18T10:15:00',
      unread: false,
    },
    {
      id: 3,
      senderId: 4,
      senderName: 'Emily Chen',
      senderAvatar: 'EC',
      content: "I've sent you the materials for our session.",
      timestamp: '2024-01-17T09:00:00',
      unread: false,
    },
  ];

  const chatHistory = [
    {
      id: 1,
      sender: 'Dr. Sarah Mitchell',
      message: "Hi! I'm available for the session tomorrow at 2 PM.",
      time: '2:30 PM',
      isOwn: false,
    },
    {
      id: 2,
      sender: 'You',
      message: "That works perfectly, thank you!",
      time: '2:35 PM',
      isOwn: true,
    },
    {
      id: 3,
      sender: 'Dr. Sarah Mitchell',
      message: "Great! I'll prepare some practice problems for you.",
      time: '2:40 PM',
      isOwn: false,
    },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="flex h-[600px]">
            {/* Sidebar - Conversations */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {mockMessages.length > 0 ? (
                  mockMessages.map((msg) => (
                    <MessagePreview
                      key={msg.id}
                      message={msg}
                      isActive={selectedChat === msg.id}
                      onClick={() => setSelectedChat(msg.id)}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon="💬"
                    title="No messages"
                    description="Start a conversation with a tutor today."
                  />
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-semibold">
                      {mockMessages.find(m => m.id === selectedChat)?.senderAvatar || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {mockMessages.find(m => m.id === selectedChat)?.senderName}
                      </p>
                      <p className="text-xs text-green-500">Online</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            msg.isOwn
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.isOwn ? 'text-primary-200' : 'text-gray-500'}`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <FaPaperclip className="w-5 h-5" />
                      </button>
                      <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        {/* <FaSmile className="w-5 h-5" /> */}
                      </button>
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {/* <FaSend className="w-5 h-5" /> */}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-gray-900">Select a conversation</h3>
                    <p className="text-gray-500 mt-2">Choose a conversation from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;