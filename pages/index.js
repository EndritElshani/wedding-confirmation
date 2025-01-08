import React, { useState, useEffect } from 'react';
import { Check, X, Search } from 'lucide-react';
import { invitedFamilies, SCRIPT_URL } from './guestlist';
import { useRouter } from 'next/router';

const WeddingLanding = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [attendingMembers, setAttendingMembers] = useState(new Set());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedRSVP = localStorage.getItem('weddingRSVP');
    if (savedRSVP) {
      const data = JSON.parse(savedRSVP);
      const family = invitedFamilies.find(f => f.familyName === data.familyName);
      if (family) {
        setSelectedFamily(family);
        setAttendingMembers(new Set(data.memberNames));
        setNotes(data.additionalNotes);
      }
    }
  }, []);

  const filteredFamilies = invitedFamilies
    .filter(family =>
      family.familyName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 5);

  const handleMemberClick = (member) => {
    setAttendingMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(member)) {
        newSet.delete(member);
      } else {
        newSet.add(member);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    // Reset error state
    setError('');
    
    // Validate family selection
    if (!selectedFamily) {
      setError('Ju lutem zgjidhni një familje');
      return;
    }

    // Validate attending members
    if (attendingMembers.size === 0) {
      setError('Ju lutem zgjidhni të paktën një anëtar');
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = {
        submissionDate: new Date().toISOString(),
        familyName: selectedFamily.familyName,
        attendingStatus: 'Attending',
        memberCount: attendingMembers.size,
        memberNames: Array.from(attendingMembers).join(', '),
        additionalNotes: notes || '',
        isUpdate: false
      };

      // Check if this is an update
      const existingRSVP = localStorage.getItem('weddingRSVP');
      if (existingRSVP) {
        const existingData = JSON.parse(existingRSVP);
        submissionData.isUpdate = true;
        submissionData.previousFamilyName = existingData.familyName;
      }

      // Send to Google Sheets - removed mode: 'no-cors' and stringified the data differently
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(submissionData)
      });

      // Store in localStorage (store the full array version for local use)
      const localStorageData = {
        ...submissionData,
        memberNames: Array.from(attendingMembers)
      };
      localStorage.setItem('weddingRSVP', JSON.stringify(localStorageData));
      
      router.push('/submitted');
    } catch (err) {
      console.error('Submission error:', err);
      setError('Ndodhi një problem. Ju lutem provoni përsëri.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700/50">
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
              </div>

              <div className="space-y-3">
                {selectedFamily.members.map((member, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg border border-gray-700/50 transition-all hover:border-gray-600/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-200">{member}</span>
                      <button
                        onClick={() => handleMemberClick(member)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          attendingMembers.has(member)
                            ? 'bg-pink-600 hover:bg-pink-500 text-white'
                            : 'bg-white/5 hover:bg-white/10 border border-gray-700/50'
                        }`}
                      >
                        {attendingMembers.has(member) ? (
                          <span className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Po
                          </span>
                        ) : 'Konfirmo'}
                      </button>
                    </div>
                  </div>
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
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full ${
                  isSubmitting ? 'bg-pink-600/50' : 'bg-pink-600 hover:bg-pink-500'
                } text-white p-4 rounded-lg font-medium transition-all`}
              >
                {isSubmitting ? 'Duke dërguar...' : 'Konfirmo pjesëmarrjen'}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default WeddingLanding;