// src/pages/Chat/Chat.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;
const POLL_INTERVAL = 2000; // 2s long-poll cycle

const Messages = () => {
  const { chatId } = useParams();
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null); // { other: { id, name, profilePic } }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const pollRef = useRef(null);
  const inputRef = useRef(null);

  const buildPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return `${API_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
  };

  // ============ Initial load: chat + all messages ============
  useEffect(() => {
    if (!chatId || !user) return;

    const init = async () => {
      setLoading(true);
      try {
        // load messages
        const msgRes = await fetch(`${API_URL}/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        });

        const msgData = await msgRes.json();
        if (!msgRes.ok) throw new Error(msgData.message || 'Failed to load messages');

        const msgs = msgData.messages || [];
        setMessages(msgs);

        // 👇 ADD THIS
        if (msgData.chat) setChatInfo(msgData.chat);

        if (msgs.length > 0) {
        lastTimestampRef.current = msgs[msgs.length - 1].createdAt;
        }
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, user]);

  // ============ Long polling for new messages ============
  const pollMessages = useCallback(async () => {
    if (!chatId || !accessToken) return;

    try {
      const url = new URL(`${API_URL}/api/chats/${chatId}`);
        if (lastTimestampRef.current) {
        url.searchParams.set('since', lastTimestampRef.current);
        }
        const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
        });

      if (!res.ok) return;

      const data = await res.json();
      const incoming = data.messages || [];

      if (incoming.length > 0) {
        setMessages((prev) => {
          const existing = new Set(prev.map((m) => m.id));
          const fresh = incoming.filter((m) => !existing.has(m.id));
          if (fresh.length === 0) return prev;
          return [...prev, ...fresh];
        });
        lastTimestampRef.current = incoming[incoming.length - 1].createdAt;
      }
    } catch (err) {
      // silent — network hiccup, try again next tick
    }
  }, [chatId, accessToken]);

  useEffect(() => {
    if (!chatId) return;

    // start polling
    pollRef.current = setInterval(pollMessages, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [chatId, pollMessages]);

  // ============ Auto-scroll on new messages ============
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // ============ Send ============
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || sending) return;

    const content = input.trim();
    const receiverId = chatInfo?.other?.id;
    if (!receiverId) {
      toast.error('Cannot send message — no receiver found');
      return;
    }

    setSending(true);
    setInput('');

    // optimistic
    const optimistic = {
      id: `temp_${Date.now()}`,
      chatId,
      senderId: user.id,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`${API_URL}/api/chats/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ chatId, receiverId, content }),
        });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send message');

      // replace optimistic with real
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? data.message : m))
      );
      lastTimestampRef.current = data.message.createdAt;
      inputRef.current?.focus();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to send message');
      // remove optimistic
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ============ Group messages by date ============
  const grouped = messages.reduce((acc, m) => {
    const day = new Date(m.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const otherUser = chatInfo?.other;
  const otherPhoto = buildPhotoUrl(otherUser?.profilePic);
  const otherInitials = otherUser?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      {/* ============ Header ============ */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors md:hidden"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
            {otherPhoto ? (
              <img
                src={otherPhoto}
                alt={otherUser?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              otherInitials || 'U'
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">
              {otherUser?.name || 'Chat'}
            </p>
            <p className="text-xs text-gray-500">
              {otherUser?.role === 'tutor' ? 'Tutor' : 'Student'}
            </p>
          </div>
        </div>
      </div>

      {/* ============ Messages ============ */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              <LoadingSkeleton type="text" count={5} />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState
              icon={<span className="text-5xl">💬</span>}
              title="No messages yet"
              description="Say hello and start the conversation."
            />
          ) : (
            Object.entries(grouped).map(([day, items]) => (
              <div key={day} className="mb-6">
                {/* Day divider */}
                <div className="flex items-center justify-center my-4">
                  <div className="px-3 py-1 bg-gray-200/70 rounded-full text-[11px] font-medium text-gray-600 uppercase tracking-wide">
                    {day}
                  </div>
                </div>

                <div className="space-y-3">
                  {items.map((m) => {
                    const isOwn = m.senderId === user.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${
                            isOwn ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                              isOwn
                                ? 'bg-primary-600 text-white rounded-br-md'
                                : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md shadow-soft'
                            } ${m.pending ? 'opacity-70' : ''}`}
                          >
                            {m.content}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 px-1">
                            {formatTime(m.createdAt)}
                            {m.pending && ' · sending...'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ============ Input ============ */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-4">
        <form
          onSubmit={handleSend}
          className="max-w-4xl mx-auto flex items-end gap-3"
        >
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl focus-within:border-primary-400 focus-within:bg-white transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-transparent border-0 focus:outline-none resize-none max-h-32 text-sm text-gray-900 placeholder:text-gray-400"
              style={{ minHeight: '44px' }}
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send message"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaPaperPlane className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Messages;