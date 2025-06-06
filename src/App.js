import React, { useState } from 'react';
import { Plus, Vote, BarChart3, Users, Trash2, Share2, Copy, Check } from 'lucide-react';

export default function App() {
  const [polls, setPolls] = useState([]);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'create', 'poll'
  const [activePoll, setActivePoll] = useState(null);
  const [copiedPollId, setCopiedPollId] = useState(null);
  
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', '']
  });

  const createPoll = () => {
    if (newPoll.question.trim() && newPoll.options.every(opt => opt.trim())) {
      const poll = {
        id: Date.now(),
        question: newPoll.question,
        options: newPoll.options.map(opt => ({
          text: opt,
          votes: 0
        })),
        totalVotes: 0,
        createdAt: new Date().toLocaleString()
      };
      
      setPolls([poll, ...polls]);
      setNewPoll({ question: '', options: ['', ''] });
      setCurrentView('home');
    }
  };

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll({
        ...newPoll,
        options: [...newPoll.options, '']
      });
    }
  };

  const removeOption = (index) => {
    if (newPoll.options.length > 2) {
      setNewPoll({
        ...newPoll,
        options: newPoll.options.filter((_, i) => i !== index)
      });
    }
  };

  const updateOption = (index, value) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({
      ...newPoll,
      options: updatedOptions
    });
  };

  const vote = (pollId, optionIndex) => {
    setPolls(polls.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = [...poll.options];
        updatedOptions[optionIndex].votes += 1;
        return {
          ...poll,
          options: updatedOptions,
          totalVotes: poll.totalVotes + 1
        };
      }
      return poll;
    }));
  };

  const deletePoll = (pollId) => {
    setPolls(polls.filter(poll => poll.id !== pollId));
    if (activePoll && activePoll.id === pollId) {
      setActivePoll(null);
      setCurrentView('home');
    }
  };

  const getPercentage = (votes, total) => {
    return total === 0 ? 0 : Math.round((votes / total) * 100);
  };

  const generateShareLink = (pollId) => {
    return `${window.location.origin}${window.location.pathname}?poll=${pollId}`;
  };

  const copyShareLink = async (pollId) => {
    const shareLink = generateShareLink(pollId);
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedPollId(pollId);
      setTimeout(() => setCopiedPollId(null), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedPollId(pollId);
      setTimeout(() => setCopiedPollId(null), 2000);
    }
  };

  // Home View
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Quick Poll</h1>
            <p className="text-gray-600">Create polls, get instant feedback</p>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={() => setCurrentView('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create New Poll
            </button>
          </div>

          {polls.length === 0 ? (
            <div className="text-center py-12">
              <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No polls yet</h3>
              <p className="text-gray-500">Create your first poll to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {polls.map(poll => (
                <div key={poll.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-800 flex-1 pr-2">{poll.question}</h3>
                    <button
                      onClick={() => deletePoll(poll.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {poll.totalVotes} votes
                    </div>
                    <div>{poll.createdAt}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActivePoll(poll);
                        setCurrentView('poll');
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      View & Vote
                    </button>
                    <button
                      onClick={() => copyShareLink(poll.id)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 py-2 px-3 rounded-lg transition-colors flex items-center gap-1"
                      title="Copy share link"
                    >
                      {copiedPollId === poll.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Create Poll View
  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create New Poll</h2>
              <button
                onClick={() => setCurrentView('home')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Back
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poll Question
                </label>
                <input
                  type="text"
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  placeholder="What's your question?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Answer Options
                </label>
                <div className="space-y-3">
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {newPoll.options.length < 6 && (
                  <button
                    onClick={addOption}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Option
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createPoll}
                  disabled={!newPoll.question.trim() || !newPoll.options.every(opt => opt.trim())}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Create Poll
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Poll View
  if (currentView === 'poll' && activePoll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentView('home')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Back to Polls
              </button>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  {activePoll.totalVotes} total votes
                </div>
                <button
                  onClick={() => copyShareLink(activePoll.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  {copiedPollId === activePoll.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share
                    </>
                  )}
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              {activePoll.question}
            </h2>

            <div className="space-y-4">
              {activePoll.options.map((option, index) => {
                const percentage = getPercentage(option.votes, activePoll.totalVotes);
                return (
                  <div key={index} className="relative">
                    <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800 flex-1">
                          {option.text}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-600">
                            {percentage}%
                          </span>
                          <button
                            onClick={() => vote(activePoll.id, index)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1"
                          >
                            <Vote className="w-4 h-4" />
                            Vote
                          </button>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        {option.votes} votes
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Share this poll with others:
                </p>
                <div className="flex items-center gap-2 bg-white p-2 rounded border">
                  <input
                    type="text"
                    value={generateShareLink(activePoll.id)}
                    readOnly
                    className="flex-1 text-sm text-gray-600 bg-transparent border-none outline-none"
                  />
                  <button
                    onClick={() => copyShareLink(activePoll.id)}
                    className="text-blue-600 hover:text-blue-700 p-1"
                    title="Copy link"
                  >
                    {copiedPollId === activePoll.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              Click the Vote button for your choice • Results update instantly
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}