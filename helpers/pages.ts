export type VrRole =
  | 'student'
  | 'instructor'
  | 'companyadmin'
  | 'provider'
  | 'multirole'
  | 'evaluator'
  | 'auditor'
  | 'assessor'
  | 'contenteditor';

export type VrPage = {
  name: string;
  path: string;
  role?: VrRole | VrRole[];
};

/**
 * Endpoints only; resolved relative to Playwright baseURL so env switching works.
 * Pages without a `role` are public. Pages with a `role` require login as that role.
 */
export const vrPages: VrPage[] = [
  // ── Core navigation ───────────────────────────────────────────────────────
  { name: 'Home', path: '/' },
  // { name: 'Courses', path: '/courses' },
  // { name: 'Resource Centre', path: '/resource-centre' },
  // { name: 'Learners', path: '/learners' },
  // { name: 'Learners page', path: '/learnerspage' },
  // { name: 'Employers', path: '/employers' },
  // { name: 'Employers page', path: '/employerspage' },
  // { name: 'Industry Leaders', path: '/industry-leaders' },
  // { name: 'Industry Leaders (industryleaders)', path: '/industryleaders' },
  // { name: 'Resource Centre Listing', path: '/resource-centre-listing' },
  // { name: 'Resources Listing', path: '/resources-listing' },

  // // ── News & Events ──────────────────────────────────────────────────────────
  // { name: 'News Events Listing', path: '/news-events' },
  // {
  //   name: 'News Digital Learning Hub',
  //   path: '/news/energy-safety-canada-launches-digital-learning-hub-strengthen-worker-safety-across-canadas-0',
  // },
  // {
  //   name: 'Event Peter Zebedee',
  //   path: '/event/energy-safety-canada-appoints-mr-peter-zebedee-board-chair',
  // },
  // { name: 'Event H2S Aliver', path: '/event/h2s-aliver' },
  // { name: 'Safety Alerts Listing', path: '/safety-alerts' },
  // { name: 'Submit Safety Alert', path: '/submit-safety-alert' },

  // // ── Courses ────────────────────────────────────────────────────────────────
  // { name: 'Course Registration Options', path: '/course-registration-options' },
  // { name: 'Course Detail 10870', path: '/course/10870' },
  // { name: 'Course Detail 11360', path: '/course/11360' },
  // { name: 'Course Detail 10110', path: '/course/10110' },

  // // ── ATP / Instructors ──────────────────────────────────────────────────────
  // { name: 'Find ATP', path: '/find-atp' },
  // { name: 'Become ATP', path: '/become-atp' },
  // { name: 'Find ATP P', path: '/find-atp-p' },
  // { name: 'Become Certified Instructor', path: '/become-certified-instructor-0' },
  // { name: 'Find Auditor', path: '/find-auditor' },

  // // ── Certificates ───────────────────────────────────────────────────────────
  // { name: 'Certificates', path: '/certificates' },
  // { name: 'Certificates Validation', path: '/certificates-validation' },

  // // ── COR / SECOR ────────────────────────────────────────────────────────────
  // { name: 'COR Internal', path: '/helping-companies-achieve-and-maintain-cor-internal' },
  // { name: 'COR External', path: '/helping-companies-achieve-and-maintain-cor-external' },
  // { name: 'COR Overview', path: '/build-safer-stronger-workplace-energy-safety-canada' },
  // { name: 'COR SECOR Overview', path: '/cor-secor-overview' },
  // { name: 'COR Navigation Pathway', path: '/cor-navigation-pathway' },
  // { name: 'SECOR Navigation Pathway', path: '/secor-navigation-pathway' },
  // { name: 'SECOR Navigation Pathway (auditing fees)', path: '/secor-navigation-pathway#toc-auditing-fees' },

  // // ── Resources ──────────────────────────────────────────────────────────────
  // { name: 'Resource Simple Detail', path: '/resource/simple-resource-detail' },
  // { name: 'Resource Multiple Detail', path: '/resource/multiple-resource-detail' },
  // { name: 'DACC', path: '/dacc' },
  // { name: 'Store', path: '/store' },
  // { name: 'Focus Area (Analytics)', path: '/focus-area' },
  // { name: 'Global Collaboration', path: '/global-collaboration' },
  // { name: 'Data Gateway', path: '/data-gateway' },
  // { name: 'Industry Committees', path: '/industry-committees' },

  // // ── About ──────────────────────────────────────────────────────────────────
  // { name: 'About Us', path: '/about-us' },
  // { name: 'Our People', path: '/our-people' },
  // { name: 'Careers', path: '/careers' },
  // { name: 'Contact Us', path: '/contact-us' },
  // { name: 'Contact Us British Columbia', path: '/contact-us-british-columbia' },
  // { name: 'Contact Us Nisku', path: '/contact-us-nisku' },
  // { name: 'Contact Us Saskatchewan', path: '/contact-us-saskatchewan' },

  // // ── Legal / Policies ───────────────────────────────────────────────────────
  // { name: 'Legal', path: '/legal' },
  // { name: 'Legal Terms of Use', path: '/legal#toc-terms-of-use' },
  // { name: 'Land Acknowledgment', path: '/land-acknowledgement' },
  // { name: 'Policies', path: '/policies' },
  // { name: 'Privacy Policy', path: '/energy-safety-canadas-privacy-policy' },
  // { name: 'Terms and Conditions', path: '/terms-and-conditions' },
  // { name: 'Sitemap', path: '/sitemap' },
  // { name: 'Frankestein Page', path: '/frankestein-page' },

  // // ── Webforms ───────────────────────────────────────────────────────────────
  // { name: 'Webform Node 77', path: '/node/77' },
  // { name: 'Webform Node 78', path: '/node/78' },
  // { name: 'Webform Node 79', path: '/node/79' },
  // { name: 'Webform Node 87', path: '/node/87' },
  // { name: 'Webform Node 101', path: '/node/101' },
  // { name: 'Webform Node 113', path: '/node/113' },

  // // ── Forms ──────────────────────────────────────────────────────────────────
  // { name: 'Group Registration Form Test', path: '/form/group-registration-form-test' },
  // { name: 'Group Registration Form (donttouch)', path: '/form/group-registration-form-donttouch' },
  // { name: 'Credit Application Form Test', path: '/form/credit-application-form-test' },
  // { name: 'Credit Application Form', path: '/form/credit-application-form-0' },
  // { name: 'Customer Approved Administrator Form Test', path: '/form/customer-approved-administrator-form-test' },
  // { name: 'Customer Approved Administrator Form', path: '/form/customer-approved-administrator-form' },
  // { name: 'Become ATP Form', path: '/form/become-atp' },
  // { name: 'Companies New Energy Safety Canadas COR Program', path: '/forms/companies-new-energy-safety-canadas-cor-program' },
  // { name: 'Application COR Expiry Extension', path: '/forms/application-cor-expiry-extension' },
  // { name: 'COR Fixed Date Application', path: '/forms/cor-fixed-date-application' },
  // { name: 'Employer Health Safety Report Request', path: '/forms/employer-health-safety-report-request' },
  // { name: 'Industry Sector Report Request', path: '/forms/industry-sector-report-request' },
  // { name: 'Issue Specific Report Request', path: '/form/issue-specific-report-request' },
  // { name: 'New Issue Proposal', path: '/forms/new-issue-proposal' },
  // { name: 'Auditor Renewal Application (CHSA Renewal Program)', path: '/form/auditor-renewal-application-certified-health-and-safety-auditor-renewal-program' },
  // { name: 'External Auditor Application (CHSA Program)', path: '/form/external-auditor-application-certified-health-and-safety-auditor-program' },
  // { name: 'Internal Auditor Application (CHSA Program)', path: '/form/internal-auditor-application-certified-health-and-safety-auditor-program' },
  // { name: 'Seismic Blasters Safety Training Registration', path: '/form/seismic-blasters-safety-training-registration-information' },

  // ── Portal: Dashboard ──────────────────────────────────────────────────────
  {
    name: 'Dashboard',
    path: '/srv/dashboard',
    role: [
      'student',
      // 'instructor',
      // 'companyadmin',
      // 'provider',
      // 'multirole',
      // 'evaluator',
      // 'auditor',
      // 'assessor',
      // 'contenteditor',
    ],
  },

  // // ── Portal: User profiles ──────────────────────────────────────────────────
  // { name: 'User Profile student',       path: '/u/student?check_logged_in=1',      role: 'student' },
  // { name: 'User Profile instructor',    path: '/u/instructor?check_logged_in=1',   role: 'instructor' },
  // { name: 'User Profile provider',      path: '/u/provider?check_logged_in=1',     role: 'provider' },
  // { name: 'User Profile company',       path: '/u/company?check_logged_in=1',      role: 'companyadmin' },
  // { name: 'User Profile multiroleuser', path: '/u/multiuserrole?check_logged_in=1', role: 'multirole' },
  // { name: 'User Profile assessor',      path: '/u/assessor?check_logged_in=1',     role: 'assessor' },
  // { name: 'User Profile contenteditor', path: '/u/contenteditor?check_logged_in=1', role: 'contenteditor' },
  // {
  //   name: 'User Profile',
  //   path: '/user',
  //   role: [
  //     'student',
  //     'instructor',
  //     'companyadmin',
  //     'provider',
  //     'multirole',
  //     'evaluator',
  //     'auditor',
  //     'assessor',
  //     'contenteditor',
  //   ],
  // },

  // // ── Portal: Account settings ───────────────────────────────────────────────
  // {
  //   name: 'User Edit',
  //   path: '/srv/user/edit',
  //   role: ['student', 'instructor', 'companyadmin', 'provider', 'multirole'],
  // },
  // {
  //   name: 'User Credentials',
  //   path: '/srv/user/credentials',
  //   role: ['student', 'instructor', 'companyadmin', 'provider', 'multirole'],
  // },

  // // ── Portal: Help / FAQs ────────────────────────────────────────────────────
  // {
  //   name: 'Need help (FAQs donttouch)',
  //   path: '/srv/faqs-donttouch',
  //   role: [
  //     'student',
  //     'instructor',
  //     'companyadmin',
  //     'provider',
  //     'multirole',
  //     'evaluator',
  //     'auditor',
  //     'contenteditor',
  //   ],
  // },
  // {
  //   name: 'Need help (FAQs)',
  //   path: '/srv/faqs-portal',
  //   role: [
  //     'student',
  //     'instructor',
  //     'companyadmin',
  //     'provider',
  //     'multirole',
  //     'evaluator',
  //     'auditor',
  //     'assessor',
  //     'contenteditor',
  //   ],
  // },

  // // ── Portal: Submissions & Registrations ────────────────────────────────────
  // {
  //   name: 'Submissions',
  //   path: '/srv/submissions',
  //   role: ['student', 'instructor', 'companyadmin', 'provider', 'multirole'],
  // },
  // {
  //   name: 'Registrations',
  //   path: '/srv/registrations',
  //   role: [
  //     'student',
  //     'instructor',
  //     'companyadmin',
  //     'provider',
  //     'multirole',
  //     'evaluator',
  //     'auditor',
  //     'contenteditor',
  //   ],
  // },
  // {
  //   name: 'Registrations Completed',
  //   path: '/srv/registrations/completed',
  //   role: [
  //     'student',
  //     'instructor',
  //     'companyadmin',
  //     'provider',
  //     'multirole',
  //     'evaluator',
  //     'auditor',
  //     'contenteditor',
  //   ],
  // },

  // // ── Portal: Certifications ─────────────────────────────────────────────────
  // {
  //   name: 'My Certifications',
  //   path: '/srv/my-certifications',
  //   role: [
  //     'student',
  //     'instructor',
  //     'companyadmin',
  //     'provider',
  //     'multirole',
  //     'auditor',
  //     'contenteditor',
  //   ],
  // },
  // {
  //   name: 'My Certifications (certificate-opt-out-block)',
  //   path: '/srv/my-certifications#certificate-opt-out-block',
  //   role: [
  //     'student',
  //     'instructor',
  //     'companyadmin',
  //     'provider',
  //     'multirole',
  //     'evaluator',
  //     'auditor',
  //     'contenteditor',
  //   ],
  // },

  // // ── Portal: Access & Rostering ─────────────────────────────────────────────
  // {
  //   name: 'Access Code',
  //   path: '/srv/access-code',
  //   role: ['student', 'companyadmin'],
  // },
  // {
  //   name: 'Rostered Companies (donttouch)',
  //   path: '/srv/rostered-companies-0',
  //   role: ['companyadmin', 'multirole'],
  // },
  // {
  //   name: 'Rostered Companies (portal)',
  //   path: '/srv/rostered-companies',
  //   role: ['companyadmin', 'multirole'],
  // },
  // {
  //   name: 'Rostered Employees (example)',
  //   path: '/srv/rostered-employees/2683879',
  //   role: ['companyadmin', 'multirole'],
  // },
  // {
  //   name: 'Rostered Employees List',
  //   path: '/srv/rostered-employees-list',
  //   role: ['companyadmin', 'multirole'],
  // },
  // {
  //   name: 'Certified Personnel Look',
  //   path: '/srv/certified-personnel-look-0',
  //   role: ['companyadmin', 'multirole'],
  // },
  // {
  //   name: 'Certified Personnel Look Up',
  //   path: '/srv/certified-personnel-look-up',
  //   role: ['companyadmin', 'multirole'],
  // },

  // // ── Portal: Invoices & Payments ────────────────────────────────────────────
  // {
  //   name: 'Invoices Open',
  //   path: '/srv/invoices/open',
  //   role: [
  //     'student',
  //     'instructor',
  //     'companyadmin',
  //     'provider',
  //     'multirole',
  //     'evaluator',
  //     'auditor',
  //     'assessor',
  //     'contenteditor',
  //   ],
  // },
  // {
  //   name: 'Payments',
  //   path: '/srv/payments',
  //   role: ['companyadmin', 'multirole'],
  // },
  // {
  //   name: 'Invoices',
  //   path: '/srv/invoices',
  //   role: ['companyadmin', 'multirole'],
  // },

  // // ── Portal: Provider / Instructor tools ───────────────────────────────────
  // {
  //   name: 'Online Course Submission',
  //   path: '/srv/online-course-submission',
  //   role: ['provider', 'multirole'],
  // },
  // {
  //   name: 'Instructors List',
  //   path: '/srv/instructors-list',
  //   role: ['provider', 'multirole'],
  // },
  // {
  //   name: 'Instructor Resources',
  //   path: '/srv/instructor-resources',
  //   role: ['instructor', 'multirole'],
  // },
  // {
  //   name: 'Portal Resources',
  //   path: '/srv/resources',
  //   role: ['student', 'instructor', 'companyadmin', 'provider', 'multirole'],
  // },
  // {
  //   name: 'Student Validation',
  //   path: '/srv/student-validation',
  //   role: ['instructor', 'provider', 'multirole'],
  // },
  // {
  //   name: 'Instructor Recertification',
  //   path: '/srv/instructor-recertification',
  //   role: ['contenteditor', 'instructor', 'multirole'],
  // },
  // {
  //   name: 'ATP Renewal',
  //   path: '/srv/atp-renewal',
  //   role: ['provider', 'multirole'],
  // },

  // // ── Portal: Badges ─────────────────────────────────────────────────────────
  // {
  //   name: 'All Badges',
  //   path: '/srv/all-badges',
  //   role: [
  //     'student',
  //     'instructor',
  //     'companyadmin',
  //     'provider',
  //     'multirole',
  //     'evaluator',
  //     'auditor',
  //     'contenteditor',
  //   ],
  // },

  // // ── Portal: Assessment ─────────────────────────────────────────────────────
  // {
  //   name: 'Welcome H2S Alive Assessment',
  //   path: '/srv/welcome-h2s-alive-assessment',
  //   role: ['assessor', 'multirole'],
  // },

  // // ── Portal: Course Materials ───────────────────────────────────────────────
  // {
  //   name: 'Course Materials',
  //   path: '/srv/course-materials',
  //   role: ['provider', 'instructor', 'contenteditor', 'multirole'],
  // },
];
