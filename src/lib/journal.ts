/**
 * Single source of truth for journal-wide metadata.
 *
 * Every page, layout, and SEO tag reads from here so that changing a fact
 * (e.g. the ISSN once it is granted, or a contact address) is a one-line edit
 * rather than a find-and-replace across the site.
 */
export const journal = {
  name: 'International Journal of Applied Technology Solutions',
  shortName: 'IJATS',
  tagline: 'Bridging Innovation and Real-World Technology Solutions',
  description:
    'IJATS is a peer-reviewed, open-access journal publishing applied technology research with clear industrial, societal, or economic impact.',
  url: 'https://ijats.org',

  // ISSN is "Application in progress" — surfaced honestly until granted.
  issn: 'Application in progress',
  startYear: 2025,

  email: {
    general: 'contact@ijats.org',
    submissions: 'submissions@ijats.org',
  },

  editorInChief: {
    name: 'Sukhdevsinh Dhummad',
    title: 'Systems Architect — Enterprise Data',
  },

  // Where the journal aims to be indexed. Displayed on About as a roadmap,
  // not a claim of current indexing.
  indexingRoadmap: [
    'Google Scholar',
    'Directory of Open Access Journals (DOAJ)',
    'Scopus',
    'Web of Science (ESCI)',
  ],

  // Aims & scope topic areas — reused on Home, About, and Call for Papers.
  scope: [
    'Artificial Intelligence & Machine Learning Applications',
    'Data Engineering & Cloud Computing Solutions',
    'Internet of Things (IoT) & Smart Systems',
    'Cybersecurity Practices & Protocols',
    'Robotics, Automation & Control Systems',
    'Healthcare Informatics & Digital Health',
    'Educational Technologies & Learning Innovation',
    'Sustainable Technology & Environmental Solutions',
    'Fintech & Blockchain',
    'Manufacturing & Industrial Technology Innovation',
  ],
} as const;

/** Primary site navigation, reused by the header and footer. */
export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Issues', href: '/issues' },
  { label: 'Call for Papers', href: '/call-for-papers' },
  { label: 'Submit', href: '/submit' },
  { label: 'Contact', href: '/contact' },
] as const;
