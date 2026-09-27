import React, { useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import { X, Users, Heart, MessageSquare, Send, Sparkles, Flame, Orbit } from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_POSTS = [
  {
    id: 'post-1',
    author: 'AstralCoder_99',
    avatar: '👨‍🚀',
    category: 'Focus',
    streakMilestone: 30,
    planet: 'Azure Giant',
    timeAgo: '2 hours ago',
    content: 'Just locked in my 30-day streak on Deep Focus Coding! 🚀 My planet now orbits at maximum speed around the sun. Spacetime curvature feels great.',
    likes: 24,
    hasLiked: false,
    comments: [
      { author: 'StellaRider', text: 'Incredible velocity! My creative writing planet is following closely behind.' }
    ]
  },
  {
    id: 'post-2',
    author: 'NovaRunner',
    avatar: '👩‍🚀',
    category: 'Health',
    streakMilestone: 18,
    planet: 'Terran Prime',
    timeAgo: '5 hours ago',
    content: 'Day 18 of Morning Sunrise Running completed. My Terran world cloud patterns look so peaceful from high orbit.',
    likes: 19,
    hasLiked: true,
    comments: []
  },
  {
    id: 'post-3',
    author: 'ZenithMind',
    avatar: '🛸',
    category: 'Mindfulness',
    streakMilestone: 14,
    planet: 'Opal Crystalline',
    timeAgo: '1 day ago',
    content: '14-day meditation milestone reached under the full moon phase! The lunar alignment has expanded planetary mass.',
    likes: 31,
    hasLiked: false,
    comments: [
      { author: 'CosmicMonk', text: 'Harmony across all orbits. Keep breathing!' }
    ]
  }
];

export function SpaceFeedModal() {
  const { activeModal, setActiveModal, totalStreakSum } = useHabits();
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState('');

  if (activeModal !== 'feed') return null;

  const handleLike = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.hasLiked;
        if (nextLiked) {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.6 }
          });
        }
        return {
          ...p,
          hasLiked: nextLiked,
          likes: nextLiked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      author: 'You (Commander)',
      avatar: '🌟',
      category: 'System Win',
      streakMilestone: totalStreakSum,
      planet: 'Solar System',
      timeAgo: 'Just now',
      content: newPostText.trim(),
      likes: 1,
      hasLiked: true,
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostText('');

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#34d399" />
            <h2 className="modal-title">Space Feed • Galactic Milestones</h2>
          </div>
          <button className="drawer-close-btn" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Create Post Field */}
          <form
            onSubmit={handleCreatePost}
            style={{
              padding: '14px',
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <textarea
              className="form-input"
              rows={2}
              placeholder={`Share an orbit milestone or streak victory with the galaxy... (System Streak: ${totalStreakSum}d)`}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              style={{ resize: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="cosmic-btn cosmic-btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                <Send size={13} />
                <span>Broadcast to Universe</span>
              </button>
            </div>
          </form>

          {/* Posts Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Author Info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '24px' }}>{post.avatar}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>
                          {post.author}
                        </span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>• {post.timeAgo}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#38bdf8' }}>
                        Planet: {post.planet}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#f97316',
                      background: 'rgba(249, 115, 22, 0.15)',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Flame size={13} />
                    {post.streakMilestone}d Streak
                  </span>
                </div>

                {/* Content */}
                <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.5' }}>
                  {post.content}
                </p>

                {/* Interactions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: post.hasLiked ? '#f43f5e' : '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Heart size={15} fill={post.hasLiked ? '#f43f5e' : 'none'} />
                    <span>{post.likes} Likes</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                    <MessageSquare size={15} />
                    <span>{post.comments.length} Comments</span>
                  </div>
                </div>

                {/* Comments Preview if any */}
                {post.comments.length > 0 && (
                  <div style={{ background: 'rgba(30, 41, 59, 0.3)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#cbd5e1' }}>
                    <strong style={{ color: '#38bdf8' }}>{post.comments[0].author}:</strong> {post.comments[0].text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="cosmic-btn" onClick={() => setActiveModal(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
