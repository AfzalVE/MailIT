import { Email, Lead, SuggestedTime, DailyEventMap } from './types';

export const INITIAL_EMAILS: Email[] = [
  {
    id: 'email-1',
    sender: 'Sarah Jenkins',
    senderEmail: 's.jenkins@synergyglobal.io',
    senderAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBLjP8g-UH7HUpw4_owWuGjT0HviTltcpQQPfkdlU5glxoBppmfM3nU832A-C1yVIFlpCbJ4cYkxNL2Q6pFStqE0WaStRj41IP7gaVMrz4m9UWqGkLK31Q4R_RLKhV8K2DlNn4P0DgHayoWbzZL4J2_tqzDLJ-wGO25QaC19cIlv3v-67dLm8OdFUVSW6oJKvYydKsZusIipthBH0fieHDXIQb2VkKfV154_Q2XHJ2yuaY--Qk7jeV36NHH-73CFw0jXRdXV0FCwNw',
    subject: 'Q4 Partnership Proposal & Expansion',
    body: "Hi Alex, I hope you've been doing well since our chat at SaaStr. Synergy Global has been closely following Aether's progress, especially your recent AI-driven CRM enhancements. As we head into Q4, my team is finalizing our partnership roadmap.\n\nGiven our strong footprint in the APAC market—specifically Singapore and Tokyo—I believe there's a unique opportunity for Synergy to act as your primary distribution partner in these regions. I've attached our initial proposal outline and some revenue projections based on similar SaaS rollouts we've managed this year.\n\nWould you be open to a 15-minute sync next Tuesday or Wednesday to discuss how we might structure this? I'm particularly interested in exploring the integration of your Intel engine into our existing workflow suite.\n\nBest regards,\nSarah Jenkins",
    time: '10:42 AM',
    date: 'Oct 24, 2023',
    score: '98/100',
    aiSummary: 'AI SUMMARY: Sarah is proposing a strategic partnership for the APAC region. High urgency. Action: Review revenue share slides.',
    isRead: true,
    isClicked: true,
    clickCount: 2,
    sentiment: 88,
    intent: 98,
    engagement: 95,
    recommendedNudge: "Sarah is proposing a strategic partnership for the APAC region. High urgency. Action: Review revenue share slides.",
    attachments: [
      { name: 'APAC_Expansion_Proposal.pdf', size: '2.4 MB', type: 'pdf' },
      { name: 'Q4_Revenue_Projections.xlsx', size: '840 KB', type: 'excel' }
    ],
    suggestedResponses: [
      {
        label: 'CONFIRM MEETING',
        previewText: 'Hi Sarah, Tuesday or Wednesday works great for me. Let\'s block out 15 minutes...',
        fullText: 'Hi Sarah,\n\nThanks for reaching out! Tuesday or Wednesday works great for me. I am particularly excited about our expansion roadmap in APAC. Let\'s block out 15 minutes next Tuesday at 2 PM EST to discuss how we might structure this and explore integrating our Intel engine with Synergy Global.\n\nLooking forward to catching up!\n\nBest regards,\nAlex Rivera'
      },
      {
        label: 'EXPLAIN SYSTEM INTEGRATION',
        previewText: 'Hi Sarah, glad to hear from you. The Intel engine integration is highly feasible...',
        fullText: 'Hi Sarah,\n\nWonderful to hear from you. The integration of our Intel engine into your existing workflow suite is highly feasible and aligns perfectly with our CRM enhancements. I have reviewed your APAC proposal and would love to dive deeper. Let\'s schedule a call for Wednesday afternoon if that suits your team.\n\nWarm regards,\nAlex Rivera'
      }
    ]
  },
  {
    id: 'email-2',
    sender: 'Elena Henderson',
    senderEmail: 'elena.h@vortex-tech.com',
    senderAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEqDvv022n9-Ie5Pl18eV0lAXCVqS99XrI27CrxKIUd8Dxmsnnvbve-GJAQsNKYhtjKZHT8zSW86HFNpMa_zbQt0eCNi2_8PuEj7VOrCwik7jlflA-Ri4Zx0-zjA7tMA6Ak4cXiPM1yMFzFw4KChf7a9ZyTpOCuGn6HmWepgSlrYgvd6ff9xKjCmYy_scgn9bgzn5tDx38C6tmIyErxgmI4QMmHi2h90CE6oEc2x5bCp3ybTyAHbmBoHfBqOj9FerUWl-MXjByr-9-',
    subject: 'Finalizing the Q3 Enterprise Architecture Agreement',
    body: "Hi team, I've reviewed the updated proposal you sent yesterday. The implementation timeline for the server migration looks much more realistic now. However, I still have a few questions regarding the multi-region support and how that affects the tier-1 pricing we discussed. Specifically, if we scale beyond 5,000 active instances in EMEA, does the volume discount apply retroactively across all active nodes?\n\nLet's hop on a quick call this Friday if you're available.\n\nBest regards,\nElena",
    time: 'May 24, 2024 · 10:45 AM',
    date: 'May 24, 2024',
    score: '94/100',
    aiSummary: 'AI SUMMARY: Elena is ready to finalize the Q3 agreement but needs clarification on EMEA volume discounting. She is requesting a meeting this Friday.',
    isRead: true,
    isClicked: true,
    clickCount: 1,
    sentiment: 82,
    intent: 95,
    engagement: 90,
    recommendedNudge: "Elena is ready to finalize but needs clarification on EMEA discounting. Suggest offering retroactive calculations.",
    threadHistory: [
      {
        id: 'msg-1',
        sender: 'You',
        body: 'Elena, thanks for the quick turnaround. We\'ve updated the volume discount table on page 4 to reflect the retroactive application. I\'ve attached the revised doc here.',
        date: 'May 23, 2024',
        isMe: true
      }
    ],
    suggestedResponses: [
      {
        label: 'CONFIRM MEETING',
        previewText: 'Hi Elena, Friday works great for me. I\'ve blocked out 2 PM EST for us...',
        fullText: 'Hi Elena,\n\nFriday works great for me. I\'ve blocked out 2:00 PM EST for us to discuss the multi-region support and confirm the volume discount structure. Looking forward to finalizing our Q3 agreement!\n\nBest regards,\nAlex'
      },
      {
        label: 'EXPLAIN PRICING TIER',
        previewText: 'Elena, to clarify the tier-1 volume discount: yes, once you cross the 5k threshold...',
        fullText: 'Hi Elena,\n\nTo clarify your question regarding the EMEA scaling: yes, the volume discount does apply retroactively across all active nodes once you cross the 5,000 active instances threshold. I will make sure this clause is explicitly highlighted in the final draft. Let\'s touch base on Friday to sign off.\n\nBest regards,\nAlex'
      }
    ]
  },
  {
    id: 'email-3',
    sender: 'Mark Thompson',
    senderEmail: 'mark.t@nexuscorp.com',
    subject: 'Follow up: Enterprise Demo Feedback',
    body: "Hi Alex, thanks for the demo last week. The team was impressed with the automated routing features. We are currently reviewing the security questionnaires. Could you share your SOC2 compliance certification or security audit report? Once we have that, we can schedule the procurement team review.\n\nThanks,\nMark",
    time: '08:15 AM',
    date: 'Oct 24, 2023',
    score: '72/100',
    aiSummary: 'AI SUMMARY: Mark had questions regarding SOC2 compliance. Likely to convert if security docs are provided soon.',
    isRead: false,
    isClicked: false,
    clickCount: 0,
    sentiment: 75,
    intent: 72,
    engagement: 70,
    recommendedNudge: "Mark needs SOC2 compliance certification. Send security pack to accelerate procurement.",
    suggestedResponses: [
      {
        label: 'SEND SOC2 PACK',
        previewText: 'Hi Mark, glad to hear the team liked the demo. I have attached our latest SOC2...',
        fullText: 'Hi Mark,\n\nI am glad to hear that the team was impressed by our routing automation! I have attached our complete security pack, including our latest SOC2 Type II certification, penetration test executive summary, and security questionnaire responses.\n\nLet me know if you need any further technical docs before we schedule the procurement review!\n\nBest,\nAlex Rivera'
      }
    ]
  },
  {
    id: 'email-4',
    sender: 'Jessica Wu',
    senderEmail: 'jessica.wu@agencycreative.com',
    subject: 'Invoice #88291 - Marketing Services',
    body: "Hello Alex, please find attached our invoice #88291 for marketing consultancies in September 2023. Let me know if you need any adjustments or supplementary forms.\n\nBest,\nJessica",
    time: 'Yesterday',
    date: 'Oct 23, 2023',
    score: 'Low Priority',
    aiSummary: 'AI SUMMARY: Standard monthly billing notification. No action required unless discrepancies are found.',
    isRead: true,
    isClicked: false,
    clickCount: 0,
    sentiment: 60,
    intent: 10,
    engagement: 20,
    recommendedNudge: "No immediate action required. Review billing with accounts receivable next week.",
    suggestedResponses: [
      {
        label: 'ACKNOWLEDGE RECEIPT',
        previewText: 'Hi Jessica, received the invoice. I will forward this to our finance team...',
        fullText: 'Hi Jessica,\n\nThanks for sending over invoice #88291. I have received it and forwarded it to our finance department for processing. Payment should be disbursed in accordance with our standard net-30 terms.\n\nBest regards,\nAlex'
      }
    ]
  },
  {
    id: 'email-5',
    sender: 'Venture Capital Weekly',
    senderEmail: 'newsletter@vcweekly.co',
    subject: 'The State of AI in SaaS: 2024 Report',
    body: "This week, we dive into the latest VC funding trends, focusing on vertical AI applications, workflow automation, and how enterprise CRM structures are adopting generative drafting tools.\n\nCheck out our interactive report details online or view the attached executive deck.",
    time: 'Yesterday',
    date: 'Oct 23, 2023',
    score: 'Newsletter',
    aiSummary: 'AI SUMMARY: Trends report focusing on vertical AI. Useful context for the board meeting next Tuesday.',
    isRead: true,
    isClicked: false,
    clickCount: 0,
    sentiment: 50,
    intent: 5,
    engagement: 10,
    recommendedNudge: "Read and summarize key points on vertical CRM automation before the board meeting.",
    suggestedResponses: []
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Jonathan Sterling',
    company: 'Nexus Cloud',
    role: 'VP Growth',
    score: 98,
    engagement: 3,
    avatar: 'JS',
    aiNudge: "Suggest scheduling a meeting tomorrow to review enterprise requirements.",
    lastInteraction: 'Opened proposal 3 times today'
  },
  {
    id: 'lead-2',
    name: 'Elena Marceau',
    company: 'Vora Systems',
    role: 'Director of Engineering',
    score: 92,
    engagement: 2,
    avatar: 'EM',
    aiNudge: "Ready for pricing proposal after completing SOC2 validation.",
    lastInteraction: 'Clicked: pricing_v4.pdf'
  },
  {
    id: 'lead-3',
    name: 'Rohan Kapoor',
    company: 'Flux Digital',
    role: 'Founder',
    score: 89,
    engagement: 4,
    avatar: 'RK',
    aiNudge: "Highly active in trial account. Suggest offering customized onboarding.",
    lastInteraction: 'Completed billing setup'
  },
  {
    id: 'lead-4',
    name: 'Sarah Jenkins',
    company: 'TechFlow',
    role: 'VP Product',
    score: 92,
    engagement: 3,
    avatar: 'SJ',
    aiNudge: "Haven't heard back since the demo. Suggest sending the 'Security Whitepaper' nudge.",
    lastInteraction: 'Opened security report 12m ago'
  },
  {
    id: 'lead-5',
    name: 'Marcus Chen',
    company: 'Horizon',
    role: 'Decision Maker',
    score: 85,
    engagement: 2,
    avatar: 'MC',
    aiNudge: "Marcus opened your last email 4 times. He's likely ready for a follow-up call.",
    lastInteraction: 'Opened email 4 times'
  }
];

export const SUGGESTED_TIMES: SuggestedTime[] = [
  {
    id: 'time-1',
    day: 'Tomorrow, Oct 25',
    timeRange: '11:00 AM — 11:30 AM',
    badges: ['High Probability', 'Sarah\'s Preferred Time'],
    type: 'bolt'
  },
  {
    id: 'time-2',
    day: 'Thu, Oct 26',
    timeRange: '02:00 PM — 02:30 PM',
    type: 'schedule'
  }
];

export const CALENDAR_EVENTS: DailyEventMap = {
  24: [
    { id: 'evt-1', title: 'Sync with Acme Corp', time: '10:00 AM', type: 'primary' },
    { id: 'evt-2', title: 'Lead Score: 98 Review', time: '2:30 PM', type: 'secondary' }
  ],
  26: [
    { id: 'evt-3', title: 'AI Recommended Slot', time: '11:00 AM', type: 'tertiary' }
  ]
};
export const OPEN_RATE_DATA = [
  { day: 'MON', rate: 40 },
  { day: 'TUE', rate: 65 },
  { day: 'WED', rate: 82 },
  { day: 'THU', rate: 55 },
  { day: 'FRI', rate: 70 },
  { day: 'SAT', rate: 25 },
];
export const CLICK_THROUGH_DATA = [
  { label: 'Book a Demo', value: 18.4, rate: 75 },
  { label: 'Download Case Study', value: 9.2, rate: 45 },
  { label: 'Pricing Page', value: 11.0, rate: 55 }
];
