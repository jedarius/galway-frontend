'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
  likes: string[];
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

const BANNED_WORDS = [
  'spam', 'test-banned-word'
];

const REPLIES_PER_PAGE = 10;

export default function ThreadPage() {
  const { isLoggedIn, user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const threadId = params?.threadId as string;
  const category = params?.category as string;

  const [thread, setThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [lastReplyTime, setLastReplyTime] = useState<number | null>(null);
  const [replyCooldownCounter, setReplyCooldownCounter] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'thread' | 'reply', id: string } | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Load thread and replies
  useEffect(() => {
    if (!threadId) return;

    const storedData = localStorage.getItem('galwayForumData');
    if (storedData) {
      try {
        const forumData = JSON.parse(storedData);
        const foundThread = forumData.threads.find((t: ForumThread) => t.id === threadId);
        
        if (!foundThread) {
          router.push('/forum');
          return;
        }
        
        setThread(foundThread);
        
        // Filter replies for this thread
        const threadReplies = forumData.replies.filter((r: ForumReply) => r.threadId === threadId);
        threadReplies.sort((a: ForumReply, b: ForumReply) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setReplies(threadReplies);
        
        // Generate some mock replies if none exist
        if (threadReplies.length === 0 && foundThread.replyCount > 0) {
          generateMockReplies(foundThread);
        }
      } catch (error) {
        console.error('Failed to load thread:', error);
        router.push('/forum');
      }
    }
  }, [threadId, router]);

  // Generate mock replies for demo
  const generateMockReplies = (thread: ForumThread) => {
    const mockReplies: ForumReply[] = [];
    
    if (thread.id === 'thread-a1b2c3') {
      // Rit Dye thread replies
      mockReplies.push(
        {
          id: 'reply-001',
          threadId: thread.id,
          content: "Great research! I've been experimenting with natural dyes lately and found that cotton pre-treatment with mordants significantly improves color fastness. Have you tried using iron or copper mordants?",
          author: {
            username: 'textile_expert',
            role: 'contributor',
            oliveBranch: {
              svg: `<svg width="100%" height="100%" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="70" height="70" fill="${OLIVE_BRANCH_BG_COLOR}"/>
<rect x="33" y="20" width="4" height="30" fill="#CD853F"/>
<rect x="24" y="27" width="12" height="4" fill="#CD853F"/>
<rect x="34" y="37" width="12" height="4" fill="#CD853F"/>
<rect x="24" y="44" width="12" height="4" fill="#CD853F"/>
<rect x="18" y="25" width="8" height="4" fill="#006400"/>
<rect x="20" y="29" width="8" height="4" fill="#006400"/>
<rect x="42" y="35" width="8" height="4" fill="#006400"/>
<rect x="44" y="39" width="8" height="4" fill="#006400"/>
<rect x="18" y="42" width="8" height="4" fill="#006400"/>
<rect x="20" y="46" width="8" height="4" fill="#006400"/>
<rect x="20" y="32" width="4" height="4" fill="#8B4513"/>
<rect x="40" y="42" width="4" height="4" fill="#8B4513"/>
</svg>`
            }
          },
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          likes: ['dye_researcher_42', 'color_scientist'],
          isReported: false
        },
        {
          id: 'reply-002',
          threadId: thread.id,
          content: "Interesting findings! What water temperature did you use for testing? I've noticed that hotter water (around 140°F) gives better initial saturation but cooler water (100°F) might preserve the fabric integrity better over time.",
          author: {
            username: 'color_scientist',
            role: 'operative',
            oliveBranch: {
              svg: `<svg width="100%" height="100%" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="70" height="70" fill="${OLIVE_BRANCH_BG_COLOR}"/>
<rect x="33" y="20" width="4" height="30" fill="#DEB887"/>
<rect x="24" y="27" width="12" height="4" fill="#DEB887"/>
<rect x="34" y="37" width="12" height="4" fill="#DEB887"/>
<rect x="24" y="44" width="12" height="4" fill="#DEB887"/>
<rect x="18" y="25" width="8" height="4" fill="#2E8B57"/>
<rect x="20" y="29" width="8" height="4" fill="#2E8B57"/>
<rect x="42" y="35" width="8" height="4" fill="#2E8B57"/>
<rect x="44" y="39" width="8" height="4" fill="#2E8B57"/>
<rect x="18" y="42" width="8" height="4" fill="#2E8B57"/>
<rect x="20" y="46" width="8" height="4" fill="#2E8B57"/>
<rect x="20" y="32" width="4" height="4" fill="#2F2F2F"/>
<rect x="40" y="42" width="4" height="4" fill="#2F2F2F"/>
<rect x="26" y="49" width="4" height="4" fill="#2F2F2F"/>
<rect x="48" y="35" width="4" height="4" fill="#2F2F2F"/>
</svg>`
            }
          },
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          likes: ['textile_expert'],
          isReported: false
        }
      );
    }
    
    if (mockReplies.length > 0) {
      const storedData = localStorage.getItem('galwayForumData');
      if (storedData) {
        const forumData = JSON.parse(storedData);
        forumData.replies = [...forumData.replies, ...mockReplies];
        localStorage.setItem('galwayForumData', JSON.stringify(forumData));
        setReplies(mockReplies);
      }
    }
  };

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
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if user can post
  const canPost = () => {
    if (!isLoggedIn || !user) return false;
    const userData = localStorage.getItem('galwayUser');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.isEmailVerified === true;
    }
    return false;
  };

  // Check reply cooldown
  const canReplyNow = () => {
    if (!lastReplyTime) return true;
    const cooldownMs = 60 * 1000; // 1 minute
    const now = Date.now();
    return (now - lastReplyTime) > cooldownMs;
  };

  // Live reply cooldown counter
  useEffect(() => {
    if (!lastReplyTime) {
      setReplyCooldownCounter(null);
      return;
    }

    const updateCounter = () => {
      const cooldownMs = 60 * 1000; // 1 minute
      const now = Date.now();
      const timeLeft = cooldownMs - (now - lastReplyTime);
      
      if (timeLeft <= 0) {
        setReplyCooldownCounter(null);
        return;
      }
      
      const seconds = Math.ceil(timeLeft / 1000);
      setReplyCooldownCounter(`${seconds}s`);
    };

    updateCounter(); // Initial update
    const interval = setInterval(updateCounter, 1000); // Update every second

    return () => clearInterval(interval);
  }, [lastReplyTime]);

  // Check for banned words
  const containsBannedWords = (text: string) => {
    const lowercaseText = text.toLowerCase();
    return BANNED_WORDS.some(word => lowercaseText.includes(word.toLowerCase()));
  };

  // Handle like toggle
  const handleLike = (type: 'thread' | 'reply', id: string) => {
    if (!canPost() || !user) return;

    const storedData = localStorage.getItem('galwayForumData');
    if (storedData) {
      const forumData = JSON.parse(storedData);
      
      if (type === 'thread' && thread) {
        const threadIndex = forumData.threads.findIndex((t: ForumThread) => t.id === id);
        if (threadIndex !== -1) {
          const isLiked = forumData.threads[threadIndex].likes.includes(user.username);
          if (isLiked) {
            forumData.threads[threadIndex].likes = forumData.threads[threadIndex].likes.filter((u: string) => u !== user.username);
          } else {
            forumData.threads[threadIndex].likes.push(user.username);
          }
          setThread(forumData.threads[threadIndex]);
        }
      } else if (type === 'reply') {
        const replyIndex = forumData.replies.findIndex((r: ForumReply) => r.id === id);
        if (replyIndex !== -1) {
          const isLiked = forumData.replies[replyIndex].likes.includes(user.username);
          if (isLiked) {
            forumData.replies[replyIndex].likes = forumData.replies[replyIndex].likes.filter((u: string) => u !== user.username);
          } else {
            forumData.replies[replyIndex].likes.push(user.username);
          }
          // Update local state
          setReplies(prev => prev.map(r => r.id === id ? forumData.replies[replyIndex] : r));
        }
      }
      
      localStorage.setItem('galwayForumData', JSON.stringify(forumData));
    }
  };

  // Handle reply submission
  const handleReplySubmit = async () => {
    if (!canPost() || !user || !thread || isSubmitting) return;
    
    setSubmitError('');
    
    // Validation
    if (newReply.trim().length < 3) {
      setSubmitError('Reply must be at least 3 characters');
      return;
    }
    if (newReply.trim().length > 5000) {
      setSubmitError('Reply must be 5,000 characters or less');
      return;
    }
    
    // Check banned words
    if (containsBannedWords(newReply)) {
      setSubmitError('Your reply contains prohibited content. If you believe this is an error, please contact support.');
      return;
    }
    
    // Check cooldown
    if (!canReplyNow()) {
      setSubmitError('Reply on cooldown');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const replyId = `reply-${Math.random().toString(36).substr(2, 6)}`;
      const userData = JSON.parse(localStorage.getItem('galwayUser') || '{}');
      
      const newReplyObj: ForumReply = {
        id: replyId,
        threadId: thread.id,
        content: newReply.trim(),
        author: {
          username: user.username,
          role: user.role,
          oliveBranch: userData.oliveBranch || user.oliveBranch
        },
        createdAt: new Date().toISOString(),
        likes: [],
        isReported: false
      };
      
      const storedData = localStorage.getItem('galwayForumData');
      if (storedData) {
        const forumData = JSON.parse(storedData);
        forumData.replies.push(newReplyObj);
        
        // Update thread reply count and last reply
        const threadIndex = forumData.threads.findIndex((t: ForumThread) => t.id === thread.id);
        if (threadIndex !== -1) {
          forumData.threads[threadIndex].replyCount += 1;
          forumData.threads[threadIndex].lastReply = {
            author: user.username,
            timestamp: new Date().toISOString()
          };
          forumData.threads[threadIndex].updatedAt = new Date().toISOString();
          setThread(forumData.threads[threadIndex]);
        }
        
        localStorage.setItem('galwayForumData', JSON.stringify(forumData));
        setReplies(prev => [...prev, newReplyObj]);
        setLastReplyTime(Date.now());
        setNewReply('');
        
        // Navigate to last page if needed
        const totalPages = Math.ceil((replies.length + 1) / REPLIES_PER_PAGE);
        if (currentPage < totalPages) {
          setCurrentPage(totalPages);
        }
      }
      
    } catch (error) {
      setSubmitError('Failed to post reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle report submission
  const handleReport = () => {
    if (!reportTarget || !reportReason.trim()) return;
    
    // In a real app, this would send to a moderation queue
    console.log('Report submitted:', { target: reportTarget, reason: reportReason });
    
    setShowReportModal(false);
    setReportTarget(null);
    setReportReason('');
  };

  // Pagination
  const totalPages = Math.ceil(replies.length / REPLIES_PER_PAGE);
  const startIndex = (currentPage - 1) * REPLIES_PER_PAGE;
  const endIndex = startIndex + REPLIES_PER_PAGE;
  const currentReplies = replies.slice(startIndex, endIndex);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Login Required</h1>
          <p className="text-neutral-600 font-mono text-sm mb-6">
            You must be logged in to view forum threads.
          </p>
          <Link 
            href={`/login?redirect=${encodeURIComponent(`/forum/${category}/${threadId}`)}`}
            className="px-4 py-2 bg-neutral-900 text-white font-mono text-sm rounded hover:bg-neutral-700 transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 font-mono text-sm">Loading thread...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6 text-sm font-mono text-neutral-600">
          <Link href="/forum" className="hover:text-neutral-900 transition-colors">
            Forum
          </Link>
          <span>›</span>
          <span className="capitalize">{thread.category}</span>
        </div>

        {/* Thread Header */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
          <div className="flex items-start space-x-4 mb-4">
            {/* Author Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                {thread.author.oliveBranch?.svg && (
                  <div 
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: thread.author.oliveBranch.svg }}
                  />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span 
                  className="font-mono text-sm font-medium flex items-center space-x-1"
                  style={{ color: getRoleColor(thread.author.role) }}
                >
                  <span>{thread.author.username}</span>
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs text-neutral-500">OP</span>
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  {formatTime(thread.createdAt)}
                </span>
              </div>

              <h1 className="text-2xl font-semibold text-neutral-900 mb-4">{thread.title}</h1>
              <div className="prose prose-sm max-w-none">
                <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{thread.content}</p>
              </div>

              {/* Thread Actions */}
              <div className="flex items-center space-x-4 mt-4">
                <button
                  onClick={() => handleLike('thread', thread.id)}
                  disabled={!canPost()}
                  className={`flex items-center space-x-1 text-xs font-mono transition-colors duration-200 ${
                    canPost() && user && thread.likes.includes(user.username)
                      ? 'text-red-600 hover:text-red-700'
                      : 'text-neutral-500 hover:text-neutral-700'
                  } ${!canPost() ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span>{thread.likes.length}</span>
                </button>
                
                <button
                  onClick={() => {
                    setReportTarget({ type: 'thread', id: thread.id });
                    setShowReportModal(true);
                  }}
                  className="text-xs font-mono text-neutral-500 hover:text-red-600 transition-colors duration-200"
                >
                  Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Email Verification Warning */}
        {isLoggedIn && !canPost() && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 font-mono">
              Email verification required to like posts or post replies.
            </p>
          </div>
        )}

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 font-mono">
              Replies ({replies.length})
            </h2>
            
            <div className="space-y-4">
              {currentReplies.map((reply) => (
                <div key={reply.id} className="bg-white rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-start space-x-3">
                    {/* Author Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 border border-neutral-200 rounded overflow-hidden bg-neutral-50">
                        {reply.author.oliveBranch?.svg && (
                          <div 
                            className="w-full h-full"
                            dangerouslySetInnerHTML={{ __html: reply.author.oliveBranch.svg }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span 
                          className="font-mono text-sm font-medium"
                          style={{ color: getRoleColor(reply.author.role) }}
                        >
                          {reply.author.username}
                        </span>
                        <span className="text-xs text-neutral-500 font-mono">
                          {formatTime(reply.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap mb-3">
                        {reply.content}
                      </p>

                      {/* Reply Actions */}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLike('reply', reply.id)}
                          disabled={!canPost()}
                          className={`flex items-center space-x-1 text-xs font-mono transition-colors duration-200 ${
                            canPost() && user && reply.likes.includes(user.username)
                              ? 'text-red-600 hover:text-red-700'
                              : 'text-neutral-500 hover:text-neutral-700'
                          } ${!canPost() ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          <span>{reply.likes.length}</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setReportTarget({ type: 'reply', id: reply.id });
                            setShowReportModal(true);
                          }}
                          className="text-xs font-mono text-neutral-500 hover:text-red-600 transition-colors duration-200"
                        >
                          Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-mono border border-neutral-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                >
                  ←
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-sm font-mono rounded ${
                        currentPage === page
                          ? 'bg-neutral-900 text-white'
                          : 'border border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-mono border border-neutral-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reply Form */}
        {canPost() && (
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 font-mono">Post Reply</h3>
            
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700 font-mono">{submitError}</p>
              </div>
            )}

            <div className="space-y-4">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                maxLength={5000}
                rows={6}
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm resize-vertical"
                placeholder="Share your thoughts, research findings, or contribute to the discussion..."
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500 font-mono">
                  {newReply.length}/5,000 characters
                </p>
                <div className="flex items-center space-x-2">
                  {replyCooldownCounter && (
                    <div className="text-xs font-mono text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                      {replyCooldownCounter}
                    </div>
                  )}
                  <button
                    onClick={handleReplySubmit}
                    disabled={isSubmitting || !newReply.trim() || newReply.trim().length < 3 || !canReplyNow()}
                    className="px-4 py-2 bg-neutral-900 text-white font-mono text-sm rounded hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 uppercase tracking-wide"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back to Forum */}
        <div className="mt-8 text-center">
          <Link 
            href="/forum"
            className="text-neutral-600 hover:text-neutral-800 transition-colors duration-200 font-mono text-sm"
          >
            ← Back to Forum
          </Link>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && reportTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900 font-mono">
                  Report {reportTarget.type === 'thread' ? 'Thread' : 'Reply'}
                </h2>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportTarget(null);
                    setReportReason('');
                  }}
                  className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                  Reason for Report
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent font-mono text-sm"
                >
                  <option value="">Select a reason...</option>
                  <option value="spam">Spam or repetitive content</option>
                  <option value="harassment">Harassment or bullying</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="misinformation">False or misleading information</option>
                  <option value="off-topic">Off-topic or irrelevant</option>
                  <option value="other">Other (contact moderators)</option>
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-xs text-yellow-800 font-mono">
                  Reports are reviewed by moderators. False reports may result in account restrictions.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportTarget(null);
                    setReportReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded font-mono text-sm hover:bg-neutral-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reportReason}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-mono text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}