// src/pages/Chat/ChatList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaCommentDots } from 'react-icons/fa';
import EmptyState from '../../../components/common/EmptyState';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;
const POLL_INTERVAL = 5000;

const ChatList = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const buildPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return `${API_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
  };

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  // Relative time: 2m, 3h, Yesterday, 12 Mar
  const formatRelative = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    const min = Math.floor(diff / 60000);
    const hr = Math.floor(diff / 3600000);
    const day = Math.floor(diff / 86400000);

    if (min < 1) return 'now';
    if (min < 60) return `${min}m`;
    if (hr < 24) return `${hr}h`;
    if (day === 1) return 'Yesterday';
    if (day < 7) return `${day}d`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const loadChats = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/chats`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load chats');
      setChats(data.chats || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  // initial load + poll
  useEffect(() => {
    loadChats();
    const id = setInterval(loadChats, POLL_INTERVAL);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, accessToken]);

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500 mt-2">
          Your conversations with students and tutors
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-soft border border-gray-100 h-20 animate-pulse"
            />
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 py-16">
          <EmptyState
            icon={<FaCommentDots className="w-12 h-12 text-gray-300 mx-auto" />}
            title="No conversations yet"
            description="When you start chatting with a tutor or student, they'll appear here."
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {chats.map((chat) => {
            const other = chat.other;
            const photoUrl = buildPhotoUrl(other?.profilePic);
            const initials = getInitials(other?.name);
            const lm = chat.lastMessage;

            return (
              <button
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="w-full text-left flex items-center gap-4 px-4 sm:px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={other?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ display: photoUrl ? 'none' : 'flex' }}
                    >
                      {initials}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-gray-900 truncate">
                      {other?.name || 'Chat'}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatRelative(chat.updatedAt)}
                    </span>
                  </div>

                  <p
                    className={`text-sm truncate mt-0.5 ${
                      lm?.isMine
                        ? 'text-gray-500'
                        : 'text-gray-600'
                    }`}
                  >
                    {lm ? (
                      <>
                        {lm.isMine && (
                          <span className="text-gray-400">You: </span>
                        )}
                        {lm.content}
                      </>
                    ) : (
                      <span className="italic text-gray-400">
                        No messages yet
                      </span>
                    )}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;