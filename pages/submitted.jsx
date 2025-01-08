import React, { useState, useEffect } from 'react';
import { Check, Download, Calendar, MapPin, Copy, Edit } from 'lucide-react';
import { useRouter } from 'next/router';

const createCalendarEvent = () => {
  const event = {
    title: "Endrit & Zejnep Wedding",
    description: "Wedding Celebration at Lindi Prestige",
    location: "Lindi Prestige, Prizren, Kosovo",
    startDate: "20250811T190000",
    endDate: "20250812T020000"
  };

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${event.startDate}/${event.endDate}`;

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${event.startDate}
DTEND:${event.endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  return { googleUrl, icsFile: blob };
};

const SubmittedPage = () => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  const [rsvpData, setRsvpData] = useState(null);
  const address = "Lindi Prestige, Prizren, Kosovo";
  
  useEffect(() => {
    const savedRSVP = localStorage.getItem('weddingRSVP');
    if (savedRSVP) {
      setRsvpData(JSON.parse(savedRSVP));
    }
  }, []);

  const handleEdit = () => {
    router.push('/');
  };

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadICS = () => {
    const { icsFile } = createCalendarEvent();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(icsFile);
    link.download = 'wedding-invitation.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { googleUrl } = createCalendarEvent();

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="bg-gray-800 p-8 rounded-xl mb-6">
          <div className="text-center mb-8">
            <div className="bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-semibold mb-2">Faleminderit!</h2>
            <p className="text-gray-400">Rezervimi juaj u konfirmua dhe ju presim me padurim.</p>
          </div>
        </div>

        {rsvpData && rsvpData.memberNames && (
          <div className="bg-gray-800 p-8 rounded-xl mb-6">
            <h3 className="font-medium mb-4">Detajet e rezervimit</h3>
            <div className="space-y-2 text-gray-300">
              <p>Familja: {rsvpData.familyName}</p>
              <p>Anëtarët që do të marrin pjesë:</p>
              <ul className="list-disc list-inside pl-4">
                {rsvpData.memberNames.map((member, index) => (
                  <li key={index}>{member}</li>
                ))}
              </ul>
              {rsvpData.additionalNotes && (
                <div className="mt-4">
                  <p className="font-medium">Shënime:</p>
                  <p className="text-gray-400">{rsvpData.additionalNotes}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleEdit}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 transition py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Ndrysho rezervimin
            </button>
          </div>
        )}

        <div className="bg-gray-800 p-8 rounded-xl space-y-6">
          <h3 className="font-medium mb-4">Detajet e ngjarjes</h3>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-pink-400 shrink-0" />
            <div>
              <p className="text-sm text-gray-400">Data dhe Ora</p>
              <p>11 Gusht, 2025 | 19:00</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-pink-400 shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Vendndodhja</p>
              <p className="mb-2">{address}</p>
              <button
                onClick={handleCopyAddress}
                className="text-sm flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Kopjuar!" : "Kopjo adresën"}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-xl overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2953.6544312717965!2d20.692811877317816!3d42.24319517120406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1353bf7e7c4cad0f%3A0xc500d1d24b42f010!2sLINDI%20PRESTIGE!5e0!3m2!1sde!2sde!4v1736341465248!5m2!1sde!2sde"
              className="w-full h-[300px] border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowCalendarOptions(!showCalendarOptions)}
              className="w-full bg-pink-600 hover:bg-pink-500 transition py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Shto në kalendar
            </button>

            {showCalendarOptions && (
              <div className="mt-4 space-y-3">
                <a
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-white/10 hover:bg-white/20 transition py-3 rounded-lg text-center"
                >
                  Google Calendar
                </a>
                <button
                  onClick={handleDownloadICS}
                  className="w-full bg-white/10 hover:bg-white/20 transition py-3 rounded-lg text-center"
                >
                  Apple Calendar / Outlook
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SubmittedPage;