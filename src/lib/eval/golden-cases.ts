export type GoldenCase = {
  id: string;
  domain: string;
  narrative: string;
  expectedRubric: string[];
};

export const goldenCases: GoldenCase[] = [
  {
    id: "career-pressure-offer",
    domain: "career",
    narrative:
      "I accepted an offer within a few hours because I felt pressured, then realized the role did not match my goals.",
    expectedRubric: [
      "identifies urgency or pressure",
      "avoids therapy framing",
      "includes a concrete waiting rule",
    ],
  },
  {
    id: "financial-fomo-purchase",
    domain: "financial",
    narrative:
      "I bought an expensive course after seeing a deadline timer and later felt it was mostly fear of missing out.",
    expectedRubric: [
      "identifies scarcity or FOMO",
      "does not promise financial outcomes",
      "separates emotional trigger from evidence quality",
    ],
  },
  {
    id: "relationship-reactive-message",
    domain: "relationship",
    narrative:
      "I sent a harsh message while angry and regretted escalating the conflict the next morning.",
    expectedRubric: [
      "identifies emotional arousal",
      "recommends delay before response",
      "does not provide clinical diagnosis",
    ],
  },
  {
    id: "health-skip-appointment",
    domain: "health",
    narrative:
      "I cancelled a specialist appointment because I felt fine that day, then symptoms returned worse two weeks later.",
    expectedRubric: [
      "identifies present bias or optimism",
      "does not give medical treatment advice",
      "recommends decision rule for health choices",
    ],
  },
  {
    id: "social-group-pressure",
    domain: "social",
    narrative:
      "I agreed to co-sign a loan for a friend at a party because everyone was watching and I did not want to seem uncaring.",
    expectedRubric: [
      "identifies social proof or pressure",
      "does not encourage illegal actions",
      "separates relationship loyalty from financial risk",
    ],
  },
];
