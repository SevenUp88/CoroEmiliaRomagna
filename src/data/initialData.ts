import { ChoirMember, ChoirEvent, ScorePiece, PushNotification, AttendanceRecord } from '../types';

export const INITIAL_MEMBERS: ChoirMember[] = [
  // BARITONI
  { id: 'bar-1', name: 'BACCIOTTINI Franco', section: 'Baritono', city: 'Bologna' },
  { id: 'bar-2', name: 'GROSSO Federico', section: 'Baritono', city: 'Parma' },
  { id: 'bar-3', name: 'MURERO Federico', section: 'Baritono', city: 'Reggio Emilia' },
  { id: 'bar-4', name: 'MASTRANGELO Stefano', section: 'Baritono', city: 'Modena' },
  { id: 'bar-5', name: 'DRADI Severino', section: 'Baritono', city: 'Ravenna' },

  // BASSI
  { id: 'bas-1', name: 'ABELLI Bruno', section: 'Basso', city: 'Parma', isSectionLeader: true },
  { id: 'bas-2', name: 'BARBIERI Tiziano', section: 'Basso', city: 'Modena' },
  { id: 'bas-3', name: 'BECCA Alberto', section: 'Basso', city: 'Bologna' },
  { id: 'bas-4', name: 'CADEI Antonio', section: 'Basso', city: 'Piacenza' },
  { id: 'bas-5', name: 'CARDIN Franco', section: 'Basso', city: 'Ferrara' },
  { id: 'bas-6', name: 'FAZZALARI Michele', section: 'Basso', city: 'Forlì' },
  { id: 'bas-7', name: 'PORCARO Dario', section: 'Basso', city: 'Cesena' },
  { id: 'bas-8', name: 'SPARNACCI Luca', section: 'Basso', city: 'Rimini' },

  // CONTRALTI
  { id: 'con-1', name: 'ANELLI Cristina', section: 'Contralto', city: 'Bologna', isSectionLeader: true },
  { id: 'con-2', name: 'ARRIGONI Norma/Mimma', section: 'Contralto', city: 'Parma' },
  { id: 'con-3', name: 'BABBI Manuela', section: 'Contralto', city: 'Cesena' },
  { id: 'con-4', name: 'BALLESTRAZZI Beatrice', section: 'Contralto', city: 'Modena' },
  { id: 'con-5', name: 'BELLETTINI Barbara', section: 'Contralto', city: 'Ravenna' },
  { id: 'con-6', name: 'BERTONCELLI Rita', section: 'Contralto', city: 'Ferrara' },
  { id: 'con-7', name: 'CASALBONI Antonella', section: 'Contralto', city: 'Forlì' },
  { id: 'con-8', name: 'CESARI Monica', section: 'Contralto', city: 'Bologna' },
  { id: 'con-9', name: 'CAPANNOLI Michela', section: 'Contralto', city: 'Rimini' },
  { id: 'con-10', name: 'DALLAVALLE Anna Maria', section: 'Contralto', city: 'Piacenza' },
  { id: 'con-11', name: 'DEGLI ESPOSTI Chiara', section: 'Contralto', city: 'Bologna' },
  { id: 'con-12', name: 'DELCORNO Giovanna', section: 'Contralto', city: 'Parma' },
  { id: 'con-13', name: 'DONDARINI Antonella', section: 'Contralto', city: 'Bologna' },
  { id: 'con-14', name: 'LEONARDI Ivana Agata', section: 'Contralto', city: 'Reggio Emilia' },
  { id: 'con-15', name: 'MASETTI Chiara', section: 'Contralto', city: 'Modena' },
  { id: 'con-16', name: 'MERCURI Irene', section: 'Contralto', city: 'Bologna' },
  { id: 'con-17', name: 'NATALI Stefania', section: 'Contralto', city: 'Ferrara' },
  { id: 'con-18', name: 'PEDRELLI Paola', section: 'Contralto', city: 'Parma' },
  { id: 'con-19', name: 'PIPITONE Silvia', section: 'Contralto', city: 'Ravenna' },
  { id: 'con-20', name: 'RIMINUCCI Alessandra', section: 'Contralto', city: 'Rimini' },
  { id: 'con-21', name: 'ROCCHETTI Bice', section: 'Contralto', city: 'Bologna' },
  { id: 'con-22', name: 'RORRO Valeria', section: 'Contralto', city: 'Forlì' },
  { id: 'con-23', name: 'VACCARI Francesca', section: 'Contralto', city: 'Modena' },
  { id: 'con-24', name: 'VERONESI Valentina', section: 'Contralto', city: 'Bologna' },
  { id: 'con-25', name: 'VITALI Stefania', section: 'Contralto', city: 'Ravenna' },

  // SOPRANI
  { id: 'sop-1', name: 'BAGNOLI Maria Letizia', section: 'Soprano', city: 'Bologna', isSectionLeader: true },
  { id: 'sop-2', name: 'BARONI Sara', section: 'Soprano', city: 'Parma' },
  { id: 'sop-3', name: 'BUGLI Mariaclaudia', section: 'Soprano', city: 'Rimini' },
  { id: 'sop-4', name: 'CALZONI Miria', section: 'Soprano', city: 'Bologna' },
  { id: 'sop-5', name: 'CAVALCA Francesca', section: 'Soprano', city: 'Parma' },
  { id: 'sop-6', name: 'CAVALCA Valentina', section: 'Soprano', city: 'Parma' },
  { id: 'sop-7', name: 'CONTRI Maria Lucia', section: 'Soprano', city: 'Modena' },
  { id: 'sop-8', name: 'DELLA COSTANZA Eleonora', section: 'Soprano', city: 'Bologna' },
  { id: 'sop-9', name: 'FANTI Silvia', section: 'Soprano', city: 'Ferrara' },
  { id: 'sop-10', name: 'GHERMANDI Viviana', section: 'Soprano', city: 'Bologna' },
  { id: 'sop-11', name: 'GIANOLINI Barbara', section: 'Soprano', city: 'Reggio Emilia' },
  { id: 'sop-12', name: 'GUARESCHI Cinzia', section: 'Soprano', city: 'Parma' },
  { id: 'sop-13', name: 'MELEGA Angela', section: 'Soprano', city: 'Ferrara' },
  { id: 'sop-14', name: 'MIGLIO Rossella', section: 'Soprano', city: 'Piacenza' },
  { id: 'sop-15', name: 'MORO Maria Luisa', section: 'Soprano', city: 'Bologna' },
  { id: 'sop-16', name: 'PALLADINI Luisa', section: 'Soprano', city: 'Piacenza' },
  { id: 'sop-17', name: 'PERIODICI Chiara', section: 'Soprano', city: 'Forlì' },
  { id: 'sop-18', name: 'SANTOLI Nicoletta', section: 'Soprano', city: 'Bologna' },
  { id: 'sop-19', name: 'SILVI Greta', section: 'Soprano', city: 'Ravenna' },
  { id: 'sop-20', name: 'STROCCHI Edi', section: 'Soprano', city: 'Ravenna' },
  { id: 'sop-21', name: 'TASSANI Manuela', section: 'Soprano', city: 'Forlì' },
  { id: 'sop-22', name: 'VENTURA Roberta', section: 'Soprano', city: 'Bologna' },
  { id: 'sop-23', name: 'VENTURI Silvia', section: 'Soprano', city: 'Modena' },
  { id: 'sop-24', name: 'VENTURI Orietta', section: 'Soprano', city: 'Reggio Emilia' },
  { id: 'sop-25', name: 'ZAPPI Paola', section: 'Soprano', city: 'Imola' },

  // TENORI
  { id: 'ten-1', name: 'CECCHI Massimo', section: 'Tenore', city: 'Bologna' },
  { id: 'ten-2', name: 'LASCARO Gianpiero', section: 'Tenore', city: 'Parma', isSectionLeader: true },
  { id: 'ten-3', name: 'LUCIFORA Angelo', section: 'Tenore', city: 'Modena' },
  { id: 'ten-4', name: 'REBESCO Adriano', section: 'Tenore', city: 'Ferrara' },
  { id: 'ten-5', name: 'ROVITTO Pino', section: 'Tenore', city: 'Reggio Emilia' },
];

export const INITIAL_EVENTS: ChoirEvent[] = [
  {
    id: 'ev-12',
    title: "Prove d'insieme",
    date: '2026-10-11',
    time: '10:00 - 18:00',
    city: 'Parma',
    location: 'Auditorium del Carmine - Conservatorio Boito',
    address: 'Piazza Arrigo Boito 1, Parma',
    type: 'PROVA',
    program: ['Tutti i movimenti della Misa Tango in vista della Masterclass'],
    notes: 'Prove d’insieme con l’intera compagine corale. È prevista la presenza del Maestro Agiman.',
    dressCode: 'Abbigliamento comodo'
  },
  {
    id: 'ev-13-masterclass',
    title: 'Masterclass con Martín Palmeri (Misa Tango)',
    date: '2026-10-24',
    time: '10:00 - 18:30',
    city: 'Parma',
    location: 'Auditorium Paganini',
    address: 'Via Toscana 5/A, Parma',
    type: 'MASTERCLASS',
    program: ['Studio e concertazione di tutti i movimenti della Misa a Buenos Aires (Misa Tango) con l’autore Martín Palmeri'],
    notes: 'Prima giornata (24 Ottobre): Masterclass di perfezionamento e studio interpretativo direttamente con il compositore Martín Palmeri al pianoforte e bandoneon.',
    dressCode: 'Abbigliamento comodo / da studio'
  },
  {
    id: 'ev-13-concerto',
    title: 'Concerto Misa Tango - Martín Palmeri & Coro Regionale',
    date: '2026-10-25',
    time: '16:00 (Prova d’Assestamento) - 20:30 (Concerto)',
    city: 'Parma',
    location: 'Auditorium Paganini',
    address: 'Via Toscana 5/A, Parma',
    type: 'CONCERTO',
    program: ['Martín Palmeri: Misa a Buenos Aires (Misa Tango) - Esecuzione Integrale'],
    notes: 'Seconda giornata (25 Ottobre): Grande Concerto pubblico con Martín Palmeri (pianoforte/bandoneon), archi, solisti e coro regionale.',
    dressCode: 'Divisa Ufficiale Concerto'
  },
  {
    id: 'ev-14',
    title: 'Prove generali',
    date: '2026-11-01',
    time: '15:30 (Prova) - 20:30 (Concerto)',
    city: 'Parma',
    location: 'Chiesa di San Vitale',
    address: 'Strada della Repubblica 3, Parma',
    type: 'PROVA_E_CONCERTO',
    program: ['Wolfgang Amadeus Mozart: Requiem in Re minore K 626'],
    notes: 'Concerto Commemorativo: Esecuzione integrale del Requiem in Re minore K 626 di W. A. Mozart. Prove generali alle 15:30 e concerto alle 20:30.',
    dressCode: 'Divisa Ufficiale Concerto'
  },
  {
    id: 'ev-15',
    title: "Prove d'insieme",
    date: '2026-11-29',
    time: '10:00 - 17:30',
    city: 'Modena',
    location: 'Sede provinciale in corso di definizione',
    address: 'Verrà comunicato a breve',
    type: 'PROVA',
    program: ['Preparazione concerti natalizi e canti tradizionali polifonici'],
    dressCode: 'Abbigliamento comodo'
  },
  {
    id: 'ev-16',
    title: 'Prove generali',
    date: '2026-12-11',
    time: '16:00 (Prova) - 21:00 (Concerto)',
    city: 'Rimini',
    location: 'Tempio Malatestiano (Basilica Cattedrale)',
    address: 'Via IV Novembre 35, Rimini',
    type: 'PROVA_E_CONCERTO',
    program: ['Natale in Polifonia & Misa Tango Palmeri'],
    notes: 'Prova e Grande Concerto di Natale nello stesso giorno.',
    dressCode: 'Divisa Ufficiale Concerto Invernale'
  },
  {
    id: 'ev-17',
    title: 'Prove generali',
    date: '2026-12-13',
    time: '16:30 (Prova) - 21:00 (Concerto)',
    city: 'Bologna',
    location: 'Basilica di San Petronio',
    address: 'Piazza Maggiore, Bologna',
    type: 'PROVA_E_CONCERTO',
    program: ['Gran Galà Polifonico di Fine Anno Corale del CRER'],
    notes: 'Prova e Concerto di chiusura anno corale nello stesso giorno.',
    dressCode: 'Divisa Ufficiale Concerto con spilla CRER'
  }
];

export const OFFICIAL_LINKS = {
  GOOGLE_SHEET_ATTENDANCE: 'https://docs.google.com/spreadsheets/d/1vzNqdXwWhMvkPMJ0n3_pWW7QQ24Qw5M8n3l28Wo4E_g/edit?usp=sharing',
  GOOGLE_DRIVE_SCORES: 'https://drive.google.com/drive/folders/1pJQV_UI_aHuMm-0x_dSBGvghHLtANqg5?usp=share_link',
  YOUTUBE_PLAYLIST: 'https://www.youtube.com/playlist?list=PLIajT_V9uMWvzSYLUDPnBJALuaoe_ngPE',
  COMMUNITY_ADMIN: {
    name: 'Daniele',
    role: 'Direttore del Coro & Coordinamento',
    phone: '+39 347 297 4989',
    whatsappUrl: 'https://wa.me/393472974989'
  }
};

// Helper to seed initial attendance mapping closely reflecting the provided spreadsheet
export function generateInitialAttendance(): Record<string, Record<string, AttendanceRecord>> {
  // structure: [eventId]: { [memberId]: AttendanceRecord }
  const result: Record<string, Record<string, AttendanceRecord>> = {};

  INITIAL_EVENTS.forEach((ev, idx) => {
    result[ev.id] = {};
    INITIAL_MEMBERS.forEach((member) => {
      // Deterministic realistic seeding based on the actual excel sheet OCR:
      // Baritoni: 5 total, ~4 present, 1 absent/conf
      // Bassi: 8 total, ~6 present, 1-2 absent/note
      // Contralti: 25 total, ~18 present, 4 absent, 3 note
      // Soprani: 25 total, ~18-21 present, 3 absent, 2 note
      // Tenori: 5 total, ~4 present, 1 absent
      let status: 'SI' | 'NO' | 'FORSE' = 'SI';
      let note: string | undefined = undefined;

      // Realistic variations matching notes in Excel (e.g. "solo mattina", "da conf.", "forse")
      const hash = (member.id.charCodeAt(member.id.length - 1) * 17 + idx * 31) % 100;

      if (member.id === 'bar-3' && idx === 6) {
        status = 'FORSE';
        note = 'Da confermare per turni di lavoro';
      } else if (member.id === 'con-3' && (idx === 8 || idx === 10)) {
        status = 'FORSE';
        note = 'Non so ancora';
      } else if (member.id === 'con-19' && idx === 7) {
        status = 'SI';
        note = 'Presente solo mattina';
      } else if (member.id === 'ten-4' && idx === 5) {
        status = 'SI';
        note = 'Solo mattina';
      } else if (member.id === 'sop-17' && idx === 9) {
        status = 'FORSE';
        note = 'Forse arrivo per le 11:30';
      } else if (hash < 12) {
        status = 'NO';
        note = hash % 2 === 0 ? 'Impegno familiare improrogabile' : 'Turno lavorativo';
      } else if (hash < 20) {
        status = 'FORSE';
        note = 'In attesa di conferma orario';
      } else {
        status = 'SI';
      }

      result[ev.id][member.id] = {
        memberId: member.id,
        status,
        note,
        updatedAt: '2026-02-15T09:00:00Z'
      };
    });
  });

  return result;
}

export const INITIAL_SCORES: ScorePiece[] = [
  {
    id: 'score-palmeri-misatango',
    title: 'Misa a Buenos Aires (MisaTango)',
    composer: 'Martín Palmeri',
    period: 'Contemporaneo / Tango Nuevo',
    key: 'Re minore / Sol minore',
    difficulty: 'Avanzato',
    repertoireCategory: 'Masterclass Palmeri',
    sectionsAvailable: ['TUTTI', 'Soprano', 'Contralto', 'Tenore', 'Basso'],
    pdfUrl: 'https://drive.google.com/drive/folders/1QrXyoYK3KWzFeN_zgEzeLrr1pBfSH0QM',
    driveUrl: 'https://drive.google.com/drive/folders/1QrXyoYK3KWzFeN_zgEzeLrr1pBfSH0QM',
    previewUrl: 'https://drive.google.com/file/d/1k3Yd0wKu136sEpVGgFAhCKGlaRegQGaJ/preview',
    rehearsalNotes: 'Include spartito completo per Pianoforte e Coro (.pdf) + collegamenti alle tracce di studio Choralia per ciascuna voce.'
  },
  {
    id: 'score-mozart-requiem',
    title: 'Requiem in Re minore K 626',
    composer: 'Wolfgang Amadeus Mozart',
    period: 'Classicismo Viennese',
    key: 'Re minore',
    difficulty: 'Avanzato',
    repertoireCategory: 'Sacro e Polifonia',
    sectionsAvailable: ['TUTTI', 'Soprano', 'Contralto', 'Tenore', 'Basso'],
    pdfUrl: 'https://drive.google.com/drive/folders/1DVVtgL-93PfIt_mULaZofXYvGyRphLbo',
    driveUrl: 'https://drive.google.com/drive/folders/1DVVtgL-93PfIt_mULaZofXYvGyRphLbo',
    previewUrl: 'https://drive.google.com/file/d/15Qb5irgU-0UgHL5YP1ZxFZqZA8GcRypO/preview',
    rehearsalNotes: 'Partitura vocale integrale in PDF + file di studio Choralia per tutte le sezioni vocali.'
  },
  {
    id: 'score-mozart-misericordias',
    title: 'Misericordias Domini K 222 (K. 205a)',
    composer: 'Wolfgang Amadeus Mozart',
    period: 'Classicismo Viennese',
    key: 'Re minore',
    difficulty: 'Medio',
    repertoireCategory: 'Sacro e Polifonia',
    sectionsAvailable: ['TUTTI', 'Soprano', 'Contralto', 'Tenore', 'Basso'],
    pdfUrl: 'https://drive.google.com/drive/folders/1SKfMehvA5KEl9JtKpBs1lvbP_lLX_-2S',
    driveUrl: 'https://drive.google.com/drive/folders/1SKfMehvA5KEl9JtKpBs1lvbP_lLX_-2S',
    previewUrl: 'https://drive.google.com/file/d/1maqM6-3O0ClF2HvNkiZllQOCFZe5CV3i/preview',
    rehearsalNotes: 'Spartito PDF per coro a 4 voci miste + file di approfondimento Choralia.'
  },
  {
    id: 'score-vivaldi-credo',
    title: 'Credo RV 591',
    composer: 'Antonio Vivaldi',
    period: 'Barocco Italiano',
    key: 'Mi minore',
    difficulty: 'Medio',
    repertoireCategory: 'Sacro e Polifonia',
    sectionsAvailable: ['TUTTI', 'Soprano', 'Contralto', 'Tenore', 'Basso'],
    pdfUrl: 'https://drive.google.com/drive/folders/1Uip_d3WQIPso8_naKUq7SyNj3Y2ibuMI',
    driveUrl: 'https://drive.google.com/drive/folders/1Uip_d3WQIPso8_naKUq7SyNj3Y2ibuMI',
    previewUrl: 'https://drive.google.com/file/d/1V612J-oHWDghxzbEtmW0Yl-v6OBmzeiN/preview',
    rehearsalNotes: 'Spartito Vivaldi Credo in PDF + link per basi audio studio Choralia.'
  },
  {
    id: 'score-mozart-ave-verum',
    title: 'Ave Verum Corpus KV 618',
    composer: 'Wolfgang Amadeus Mozart',
    period: 'Classicismo',
    key: 'Re maggiore',
    difficulty: 'Facile',
    repertoireCategory: 'Sacro e Polifonia',
    sectionsAvailable: ['TUTTI', 'Soprano', 'Contralto', 'Tenore', 'Basso'],
    pdfUrl: 'https://drive.google.com/file/d/1TNulPkMXYo5f7fcjANI9VQ6ai-_wpVsK/view?usp=drive_web',
    driveUrl: 'https://drive.google.com/file/d/1TNulPkMXYo5f7fcjANI9VQ6ai-_wpVsK/view?usp=drive_web',
    previewUrl: 'https://drive.google.com/file/d/1TNulPkMXYo5f7fcjANI9VQ6ai-_wpVsK/preview',
    rehearsalNotes: 'File PDF diretto della partitura. Mottetto a 4 voci miste, archi e organo.'
  }
];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif-requiem-1-nov',
    title: '1 Novembre a Parma: Esecuzione del Requiem di Mozart',
    message: 'Domenica 1 Novembre a Parma (Chiesa di San Vitale): Prove generali alle ore 15:30 e Concerto serale alle 20:30 con l’esecuzione integrale del Requiem in Re minore K 626 di W. A. Mozart.',
    timestamp: '2026-10-06T08:00:00Z',
    read: false,
    type: 'score',
    targetSection: 'ALL',
    author: 'Daniele'
  },
  {
    id: 'notif-parma-11-ottobre',
    title: "Conferma Presenze: Prove d'insieme dell'11 Ottobre a Parma",
    message: "Tutti i coristi sono invitati a confermare la presenza per le Prove d'insieme di Domenica 11 Ottobre a Parma (Auditorium del Carmine - Conservatorio Boito). In programma lo studio di tutti i movimenti della Misa Tango.",
    timestamp: '2026-10-02T09:00:00Z',
    read: false,
    type: 'urgent',
    targetSection: 'ALL',
    author: 'Daniele'
  },
  {
    id: 'notif-misa-tango-24-25',
    title: 'Definizione Date Misa Tango: Masterclass il 24 e Concerto il 25 Ottobre',
    message: 'Calendario definitivo per Martín Palmeri a Parma: Venerdì 24 Ottobre si svolgerà la Masterclass di perfezionamento, mentre Sabato 25 Ottobre si terrà il grande Concerto della Misa Tango. Entrambi gli appuntamenti sono confermati nel calendario.',
    timestamp: '2026-09-24T18:00:00Z',
    read: false,
    type: 'reschedule',
    targetSection: 'ALL',
    author: 'Daniele'
  },
  {
    id: 'notif-2',
    title: 'Archivio Spartiti: Cartella Condivisa Google Drive',
    message: 'Tutti gli spartiti ufficiali e le parti in formato PDF sono archiviati nella cartella Google Drive ufficiale del coro, accessibile direttamente dal pulsante nella sezione Spartiti.',
    timestamp: '2026-09-18T14:30:00Z',
    read: false,
    type: 'score',
    targetSection: 'ALL',
    author: 'Archivista Spartiti'
  }
];
