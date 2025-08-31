'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { OLIVE_BRANCH_BG_COLOR } from '@/lib/oliveGenerator';

interface ForumThread {
  id: string;
  category: 'research' | 'general';
  title: string;
  content: string;
  author: {
    username: string;
    role: string;
    oliveBranch: any;
  };
  createdAt: string;
  updatedAt: string;
  likes: string[]; // Array of usernames who liked
  replyCount: number;
  lastReply?: {
    author: string;
    timestamp: string;
  };
  isReported: boolean;
}

interface ForumReply {
  id: string;
  threadId: string;
  content: string;
  author: {
    username: string;
    role: string;
    oliveBranch: any;
  };
  createdAt: string;
  likes: string[];
  isReported: boolean;
}

type CategoryType = 'research' | 'general';
type SortType = 'newest' | 'oldest' | 'most-liked' | 'most-replies';

const BANNED_WORDS = [
  // Add banned words here - keeping it simple for demo
  'spam', 'test-banned-word'
];

// Mock forum data generator
const generateMockForumData = () => {
  const threads: ForumThread[] = [
    {
      id: 'thread-a1b2c3',
      category: 'research',
      title: "Rit Dye's Study: Effectiveness? Alternatives?",
      content: "Hello everyone, I've been dying my clothing for a while now with Rit Dyes and I would like to share my findings. After extensive testing with various fabric types, I've discovered that cotton blends respond significantly better than pure synthetic materials. The color retention varies dramatically based on water temperature and pH levels...",
      author: {
        username: 'dye_researcher_42',
        role: 'operative',
        oliveBranch: {
          svg: `<svg width="100%" height="100%" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="70" height="70" fill="${OLIVE_BRANCH_BG_COLOR}"/>
<rect x="33" y="20" width="4" height="30" fill="#8B7355"/>
<rect x="24" y="27" width="12" height="4" fill="#8B7355"/>
<rect x="34" y="37" width="12" height="4" fill="#8B7355"/>
<rect x="24" y="44" width="12" height="4" fill="#8B7355"/>
<rect x="18" y="25" width="8" height="4" fill="#228B22"/>
<rect x="20" y="29" width="8" height="4" fill="#228B22"/>
<rect x="42" y="35" width="8" height="4" fill="#228B22"/>
<rect x="44" y="39" width="8" height="4" fill="#228B22"/>
<rect x="18" y="42" width="8" height="4" fill="#228B22"/>
<rect x="20" y="46" width="8" height="4" fill="#228B22"/>
<rect x="20" y="32" width="4" height="4" fill="#6B8E23"/>
<rect x="40" y="42" width="4" height="4" fill="#6B8E23"/>
<rect x="26" y="49" width="4" height="4" fill="#6B8E23"/>
</svg>`
        }
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      likes: ['textile_expert', 'color_scientist'],
      replyCount: 8,
      lastReply: {
        author: 'textile_expert',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      isReported: false
    },
    {
      id: 'thread-d4e5f6',
      category: 'research',
      title: 'Quantum Botany: Temporal Leaf Pattern Analysis',
      content: 'I have been researching the correlation between quantum field fluctuations and botanical growth patterns. My preliminary findings suggest that certain plant species exhibit temporal variance in their cellular structure when exposed to controlled electromagnetic fields...',
      author: {
        username: 'quantum_botanist',
        role: 'contributor',
        oliveBranch: {
          svg: `<svg width="100%" height="100%" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="70" height="70" fill="${OLIVE_BRANCH_BG_COLOR}"/>
<rect x="33" y="20" width="4" height="30" fill="#A0522D"/>
<rect x="24" y="27" width="12" height="4" fill="#A0522D"/>
<rect x="34" y="37" width="12" height="4" fill="#A0522D"/>
<rect x="24" y="44" width="12" height="4" fill="#A0522D"/>
<rect x="18" y="25" width="8" height="4" fill="#32CD32"/>
<rect x="20" y="29" width="8" height="4" fill="#32CD32"/>
<rect x="42" y="35" width="8" height="4" fill="#32CD32"/>
<rect x="44" y="39" width="8" height="4" fill="#32CD32"/>
<rect x="18" y="42" width="8" height="4" fill="#32CD32"/>
<rect x="20" y="46" width="8" height="4" fill="#32CD32"/>
<rect x="20" y="32" width="4" height="4" fill="#663399"/>
<rect x="40" y="42" width="4" height="4" fill="#663399"/>
</svg>`
        }
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      likes: ['physics_student', 'plant_whisperer', 'dye_researcher_42'],
      replyCount: 12,
      lastReply: {
        author: 'plant_whisperer',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      isReported: false
    },
    {
      id: 'thread-g7h8i9',
      category: 'general',
      title: 'Welcome New Operatives - Introduce Yourself!',
      content: 'Hello everyone! This is a space for new operatives to introduce themselves to the community. Share a bit about your background, research interests, or what brought you to the Galway Research Institute. Remember to keep personal information minimal and focus on your academic or research pursuits.',
      author: {
        username: 'institute_moderator',
        role: 'moderator',
        oliveBranch: {
          svg: `<svg width="100%" height="100%" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="70" height="70" fill="${OLIVE_BRANCH_BG_COLOR}"/>
<rect x="33" y="20" width="4" height="30" fill="#C0C0C0"/>
<rect x="24" y="27" width="12" height="4" fill="#C0C0C0"/>
<rect x="34" y="37" width="12" height="4" fill="#C0C0C0"/>
<rect x="24" y="44" width="12" height="4" fill="#C0C0C0"/>
<rect x="18" y="25" width="8" height="4" fill="#9ACD32"/>
<rect x="20" y="29" width="8" height="4" fill="#9ACD32"/>
<rect x="42" y="35" width="8" height="4" fill="#9ACD32"/>
<rect x="44" y="39" width="8" height="4" fill="#9ACD32"/>
<rect x="18" y="42" width="8" height="4" fill="#9ACD32"/>
<rect x="20" y="46" width="8" height="4" fill="#9ACD32"/>
<rect x="20" y="32" width="4" height="4" fill="#2F2F2F"/>
<rect x="40" y="42" width="4" height="4" fill="#2F2F2F"/>
<rect x="26" y="49" width="4" height="4" fill="#2F2F2F"/>
<rect x="48" y="35" width="4" height="4" fill="#2F2F2F"/>
<rect x="22" y="45" width="4" height="4" fill="#2F2F2F"/>
</svg>`
        }
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      likes: ['new_operative_1', 'fresh_researcher', 'quantum_botanist'],
      replyCount: 23,
      lastReply: {
        author: 'fresh_researcher',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      isReported: false
    }
  ];

  return { threads, replies: [] as ForumReply[] };
};

export default function ForumPage() {
  const { isLoggedIn, user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('research');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [forumData, setForumData] = useState<{ threads: ForumThread[], replies: ForumReply[] }>({ threads: [], replies: [] });
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [lastPostTime, setLastPostTime] = useState<number | null>(null);
  const [cooldownCounter, setCooldownCounter] = useState<string | null>(null);

  // Load forum data
  useEffect(() => {
    const storedData = localStorage.getItem('galwayForumData');
    if (storedData) {
      try {
        setForumData(JSON.parse(storedData));
      } catch (error) {
        console.error('Failed to parse forum data:', error);
        const mockData = generateMockForumData();
        setForumData(mockData);
        localStorage.setItem('galwayForumData', JSON.stringify(mockData));
      }
    } else {
      const mockData = generateMockForumData();
      setForumData(mockData);
      localStorage.setItem('galwayForumData', JSON.stringify(mockData));
    }
  }, []);

  // Get role color
  const getRoleColor = (role: string) => {
    const colors = {
      guest: 'rgb(57, 57, 57)',
      operative: '#DB52F4',
      contributor: '#D5B504',
      'beta-tester': '#0D7F10',
      moderator: '#D40684'
    };
    return colors[role as keyof typeof colors] || colors.guest;
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Check if user can post (email verified)
  const canPost = () => {
    if (!isLoggedIn || !user) return false;
    const userData = localStorage.getItem('galwayUser');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.isEmailVerified === true;
    }
    return false;
  };

  // Check posting cooldown
  const canPostNow = () => {
    if (!lastPostTime) return true;
    const cooldownMs = 10 * 60 * 1000; // 10 minutes
    const now = Date.now();
    return (now - lastPostTime) > cooldownMs;
  };

  // Live cooldown counter
  useEffect(() => {
    if (!lastPostTime) {
      setCooldownCounter(null);
      return;
    }

    const updateCounter = () => {
      const cooldownMs = 10 * 60 * 1000; // 10 minutes
      const now = Date.now();
      const timeLeft = cooldownMs - (now - lastPostTime);
      
      if (timeLeft <= 0) {
        setCooldownCounter(null);
        return;
      }
      
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      setCooldownCounter(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCounter(); // Initial update
    const interval = setInterval(updateCounter, 1000); // Update every second

    return () => clearInterval(interval);
  }, [lastPostTime]);

  // Check for banned words
  const containsBannedWords = (text: string) => {
    const lowercaseText = text.toLowerCase();
    return BANNED_WORDS.some(word => lowercaseText.includes(word.toLowerCase()));
  };

  // Filter and sort threads
  const getFilteredThreads = () => {
    let filtered = forumData.threads.filter(thread => thread.category === activeCategory);
    
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'most-liked':
        filtered.sort((a, b) => b.likes.length - a.likes.length);
        break;
      case 'most-replies':
        filtered.sort((a, b) => b.replyCount - a.replyCount);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }
    
    return filtered;
  };

  // Handle new thread submission
  const handleNewThreadSubmit = async () => {
    if (!canPost() || !user || isSubmitting) return;
    
    setSubmitError('');
    
    // Validation
    if (newThreadTitle.trim().length < 3) {
      setSubmitError('Title must be at least 3 characters');
      return;
    }
    if (newThreadTitle.trim().length > 120) {
      setSubmitError('Title must be 120 characters or less');
      return;
    }
    if (newThreadContent.trim().length < 10) {
      setSubmitError('Content must be at least 10 characters');
      return;
    }
    if (newThreadContent.trim().length > 10000) {
      setSubmitError('Content must be 10,000 characters or less');
      return;
    }
    
    // Check banned words
    if (containsBannedWords(newThreadTitle) || containsBannedWords(newThreadContent)) {
      setSubmitError('Your post contains prohibited content. If you believe this is an error, please contact support.');
      return;
    }
    
                // Check cooldown
    if (!canPostNow()) {
      const timeLeft = Math.ceil((10 * 60 * 1000 - (Date.now() - (lastPostTime || 0))) / 60000);
      setSubmitError(`Thread creation on cooldown`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate posting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate thread ID
      const threadId = `thread-${Math.random().toString(36).substr(2, 6)}`;
      
      // Get user data for author info
      const userData = JSON.parse(localStorage.getItem('galwayUser') || '{}');
      
      const newThread: ForumThread = {
        id: threadId,
        category: activeCategory,
        title: newThreadTitle.trim(),
        content: newThreadContent.trim(),
        author: {
          username: user.username,
          role: user.role,
          oliveBranch: userData.oliveBranch || user.oliveBranch
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: [],
        replyCount: 0,
        isReported: false
      };
      
      const updatedData = {
        ...forumData,
        threads: [newThread, ...forumData.threads]
      };
      
      setForumData(updatedData);
      localStorage.setItem('galwayForumData', JSON.stringify(updatedData));
      setLastPostTime(Date.now());
      
      // Reset form
      setNewThreadTitle('');
      setNewThreadContent('');
      setShowNewThreadModal(false);
      
    } catch (error) {
      setSubmitError('Failed to create thread. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Forum Access Required</h1>
            <p className="text-neutral-600 font-mono text-sm leading-relaxed">
              You must be logged in to view the research forum. Please sign in or register for an operative account.
            </p>
          </div>
          <div className="space-y-3">
            <Link 
              href="/login?redirect=/forum"
              className="block w-full py-3 px-6 bg-neutral-900 text-white font-mono text-sm rounded hover:bg-neutral-700 transition-colors duration-200 uppercase tracking-wide"
            >
              Sign In
            </Link>
            <Link 
              href="/register"
              className="block w-full py-3 px-6 border border-neutral-300 text-neutral-700 font-mono text-sm rounded hover:bg-neutral-50 transition-colors duration-200 uppercase tracking-wide"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredThreads = getFilteredThreads();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-1 sm:mb-2">Research Forum</h1>
            <p className="text-xs sm:text-sm text-neutral-600 font-mono">
              Collaborative research discussions and findings
            </p>
          </div>
          <div className="flex items-center justify-end space-x-2 sm:space-x-3">
            {cooldownCounter && (
              <div className="text-[10px] sm:text-xs font-mono text-orange-600 bg-orange-50 px-1.5 sm:px-2 py-1 rounded border border-orange-200">
                <span className="hidden sm:inline">Next thread: </span>{cooldownCounter}
              </div>
            )}
            {canPost() && (
              <button
                onClick={() => setShowNewThreadModal(true)}
                disabled={!canPostNow()}
                className={`px-3 sm:px-4 py-2 font-mono text-xs sm:text-sm rounded transition-colors duration-200 uppercase tracking-wide ${
                  canPostNow()
                    ? 'bg-neutral-900 text-white hover:bg-neutral-700'
                    : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <span className="hidden sm:inline">New Thread</span>
                <span className="sm:hidden">New</span>
              </button>
            )}
          </div>
        </div>

        {/* Email verification warning */}
        {isLoggedIn && !canPost() && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800 font-mono">Email Verification Required</p>
                <p className="text-sm text-yellow-700 mt-1 font-mono">
                  You must verify your email address to create threads or post replies. Check your inbox for a verification link.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs and Controls */}
        <div className="bg-white rounded-lg border border-neutral-200 mb-4 sm:mb-6">
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-0" aria-label="Categories">
              <button
                onClick={() => setActiveCategory('research')}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium font-mono transition-all duration-200 border-b-2 ${
                  activeCategory === 'research'
                    ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                RESEARCH ({forumData.threads.filter(t => t.category === 'research').length})
              </button>
              <button
                onClick={() => setActiveCategory('general')}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium font-mono transition-all duration-200 border-b-2 ${
                  activeCategory === 'general'
                    ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                GENERAL ({forumData.threads.filter(t => t.category === 'general').length})
              </button>
            </nav>
          </div>
          
          {/* Sort Controls */}
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-mono text-neutral-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="px-2 sm:px-3 py-1 border border-neutral-300 rounded font-mono text-xs sm:text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="most-liked">Most Liked</option>
                <option value="most-replies">Most Replies</option>
              </select>
            </div>
          </div>
        </div>

        {/* Thread List */}
        <div className="space-y-4">
          {filteredThreads.length > 0 ? (
            filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className="bg-white rounded-lg border border-neutral-200 p-3 sm:p-6 hover:border-neutral-300 transition-all duration-200"
              >
                <div className="flex items-start space-x-2 sm:space-x-4">
                  {/* Author Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                      {thread.author.oliveBranch?.svg && (
                        <div 
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{ __html: thread.author.oliveBranch.svg }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Thread Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-2">
                      <span 
                        className="font-mono text-xs sm:text-sm font-medium truncate"
                        style={{ color: getRoleColor(thread.author.role) }}
                      >
                        {thread.author.username}
                      </span>
                      <div className="flex items-center space-x-1 sm:space-x-2 text-[10px] sm:text-xs text-neutral-500 font-mono">
                        <span>{formatTime(thread.createdAt)}</span>
                        {thread.lastReply && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">last reply {formatTime(thread.lastReply.timestamp)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Link 
                      href={`/forum/${thread.category[0]}/${thread.id}`}
                      className="block group"
                    >
                      <h3 className="text-sm sm:text-lg font-medium text-neutral-900 mb-1 sm:mb-2 group-hover:text-neutral-700 transition-colors line-clamp-2">
                        {thread.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2">
                        {thread.content.substring(0, 80)}
                        {thread.content.length > 80 && '...'}
                      </p>
                    </Link>

                    {/* Thread Stats */}
                    <div className="flex items-center space-x-3 sm:space-x-4 mt-2 sm:mt-4 text-[10px] sm:text-xs font-mono text-neutral-500">
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{thread.likes.length}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{thread.replyCount}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-neutral-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-neutral-600 font-mono text-sm">
                No threads in this category yet.
              </p>
              {canPost() && (
                <button
                  onClick={() => setShowNewThreadModal(true)}
                  className="mt-4 px-4 py-2 bg-neutral-900 text-white font-mono text-sm rounded hover:bg-neutral-700 transition-colors duration-200"
                >
                  Start the first discussion
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Thread Modal */}
      {showNewThreadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 font-mono">
                  Create New Thread - {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                </h2>
                <button
                  onClick={() => {
                    setShowNewThreadModal(false);
                    setNewThreadTitle('');
                    setNewThreadContent('');
                    setSubmitError('');
                  }}
                  className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700 font-mono">{submitError}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    maxLength={120}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                    placeholder="Brief, descriptive title for your thread"
                  />
                  <p className="text-xs text-neutral-500 mt-1 font-mono">
                    {newThreadTitle.length}/120 characters
                  </p>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                    Content
                  </label>
                  <textarea
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    maxLength={10000}
                    rows={12}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm resize-vertical"
                    placeholder="Share your research, findings, questions, or discussion topic..."
                  />
                  <p className="text-xs text-neutral-500 mt-1 font-mono">
                    {newThreadContent.length}/10,000 characters
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowNewThreadModal(false);
                    setNewThreadTitle('');
                    setNewThreadContent('');
                    setSubmitError('');
                  }}
                  className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-700 rounded font-mono text-sm hover:bg-neutral-300 transition-colors duration-200 uppercase tracking-wide"
                >
                  Cancel
                </button>
                <div className="flex items-center space-x-2">
                  {cooldownCounter && (
                    <div className="text-[10px] sm:text-xs font-mono text-orange-600 bg-orange-50 px-1.5 sm:px-2 py-1 rounded border border-orange-200 whitespace-nowrap">
                      <span className="hidden sm:inline">Cooldown: </span>{cooldownCounter}
                    </div>
                  )}
                  <button
                    onClick={handleNewThreadSubmit}
                    disabled={isSubmitting || !newThreadTitle.trim() || !newThreadContent.trim() || !canPostNow()}
                    className="px-4 py-3 bg-neutral-900 text-white rounded font-mono text-sm hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 uppercase tracking-wide"
                  >
                    {isSubmitting ? 'Posting...' : 'Create Thread'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}