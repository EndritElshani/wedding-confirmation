import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Search } from 'lucide-react';
import { invitedFamilies, SCRIPT_URL, generateSubmissionKey } from '../lib/guestlist';
import { useRouter } from 'next/router';

const WeddingLanding = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [attendingMembers, setAttendingMembers] = useState(new Set());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionKey, setSubmissionKey] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const checkExistingSubmission = async (familyName) => {
    try {
      // Add a query parameter to differentiate check requests
      const response = await fetch(`${SCRIPT_URL}?check=true&family=${encodeURIComponent(familyName)}`, {
        method: 'GET',
      });
      
      const data = await response.json();
      return data; // { exists: boolean, submission?: SubmissionData }
    } catch (err) {
      console.error('Check submission error:', err);
      return { exists: false };
    }
  };

  useEffect(() => {
    const verifyFamily = async () => {
      if (selectedFamily) {
        const result = await checkExistingSubmission(selectedFamily.familyName);
        
        if (result.exists) {
          // If submission exists, show edit mode with existing data
          setIsEditMode(true);
          setAttendingMembers(new Set(result.submission.memberNames.split(', ')));
          setNotes(result.submission.additionalNotes || '');
        } else {
          setIsEditMode(false);
          setAttendingMembers(new Set());
          setNotes('');
        }
      }
    };

    verifyFamily();
  }, [selectedFamily]);

  const filteredFamilies = invitedFamilies
    .filter(family =>
      family.familyName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 5);

  const handleMemberToggle = useCallback((memberName) => {
    setAttendingMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberName)) {
        newSet.delete(memberName);
      } else {
        newSet.add(memberName);
      }
      return newSet;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFamily) {
      setError('Ju lutem zgjidhni një familje.');
      return;
    }

    if (attendingMembers.size === 0) {
      setError('Ju lutem zgjidhni së paku një anëtar.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const submissionData = {
        submissionDate: new Date().toISOString(),
        familyName: selectedFamily.familyName,
        attendingStatus: 'Attending',
        memberCount: attendingMembers.size,
        memberNames: Array.from(attendingMembers).join(', '),
        additionalNotes: notes || '',
        isUpdate: isEditMode
      };

      // Save to localStorage
      localStorage.setItem('weddingRSVP', JSON.stringify({
        familyName: selectedFamily.familyName,
        memberNames: Array.from(attendingMembers),
        additionalNotes: notes
      }));

      // Submit to Google Sheets
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      router.push('/submitted');
    } catch (err) {
      console.error('Submission error:', err);
      setError('Ndodhi një problem. Ju lutem provoni përsëri.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check localStorage when family is selected
  useEffect(() => {
    if (selectedFamily) {
      const savedData = localStorage.getItem(`family_${selectedFamily.familyName}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setAttendingMembers(new Set(data.members));
        setNotes(data.notes || '');
        setError('Kjo familje tashmë e ka konfirmuar pjesëmarrjen. Mund të bëni ndryshime nëse dëshironi.');
      } else {
        setAttendingMembers(new Set());
        setNotes('');
        setError('');
      }
    }
  }, [selectedFamily]);

  if (isSubmitting) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
          <h2 className="text-2xl mb-2">Duke dërguar...</h2>
          <p className="text-gray-400">Ju lutem prisni një moment</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <header className="max-w-4xl mx-auto text-center mb-16">
        <p className="text-pink-400 text-lg mb-3 tracking-widest uppercase">Dasma e</p>
        <h1 className="text-5xl md:text-6xl font-light mb-6 tracking-wide">Endrit & Zejnep</h1>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto mb-6"></div>
        <p className="text-lg text-pink-400 mb-2">11 Gusht, 2025 | 19:00</p>
        <p className="text-lg text-pink-400 mb-8">Lindi Prestige, Prizren, Kosovo</p>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light italic">
        Familja Elshani ka kënaqësinë t’ju ftojë të ndani me ne këtë moment të veçantë. Prania juaj do ta zbukurojë dhe bëjë këtë ditë të paharrueshme.
        </p>
      </header>

      <section className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700/50">
          <h2 className="text-2xl font-light mb-8 text-center">Konfirmimi i Pjesëmarrjes</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 backdrop-blur-sm rounded-lg flex items-center border border-red-800/50">
              <X className="w-5 h-5 mr-2 text-red-400" />
              {error}
            </div>
          )}

          {!selectedFamily ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kërkoni mbiemrin tuaj..."
                  className="w-full pl-10 p-3 rounded-lg bg-white/5 border border-gray-700/50 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {searchTerm.length > 0 && (
                <div className="space-y-2">
                  {filteredFamilies.map(family => (
                    <button
                      key={family.id}
                      onClick={() => {
                        setSelectedFamily(family);
                        setAttendingMembers(new Set());
                      }}
                      className="w-full p-4 text-left bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-gray-700/50 group"
                    >
                      <span className="font-medium group-hover:text-pink-400 transition-colors">{family.familyName}</span>
                      <span className="text-sm text-gray-400 block mt-1">
                        {family.members.length} anëtarë
                      </span>
                    </button>
                  ))}
                  {searchTerm.length > 0 && filteredFamilies.length === 0 && (
                    <p className="text-center text-gray-400 py-4">
                      Nuk u gjet asnjë familje me këtë mbiemër
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-light">{selectedFamily.familyName}</h3>
                {isEditMode ? (
                  <div className="text-sm text-pink-400">Duke ndryshuar rezervimin</div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedFamily(null);
                      setSearchTerm('');
                      setAttendingMembers(new Set());
                      setNotes('');
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all flex items-center gap-2 border border-gray-600"
                  >
                    <X className="w-4 h-4" />
                    Ndrysho familjen
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedFamily.members.map((member) => (
                  <button
                    key={member}
                    type="button" // Important: specify button type
                    onClick={() => handleMemberToggle(member)}
                    className={`p-4 rounded-lg transition-colors ${
                      attendingMembers.has(member)
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {attendingMembers.has(member) && <Check className="w-4 h-4" />}
                      {member}
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-gray-300 text-sm">Shënime shtesë</label>
                <textarea
                  rows="3"
                  className="w-full p-3 rounded-lg bg-white/5 border border-gray-700/50 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${
                  isSubmitting ? 'bg-pink-600/50' : 'bg-pink-600 hover:bg-pink-500'
                } text-white p-4 rounded-lg font-medium transition-all`}
              >
                {isSubmitting ? 'Duke dërguar...' : 'Konfirmo pjesëmarrjen'}
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  );
};

export default WeddingLanding;