export interface JobDetailsData {
  info: {
    hospitalIcon: string;
    hospitalName: string;
    jobTitle: string;
  };
  grid: {
    location: string;
    experience: string;
    jobType: string;
    salary: string;
  };
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  content: {
    description: string;
    specializations: string[];
    qualifications: string[];
    interviewQuestions: {
      topic: string;
      questions: string[];
    }[];
  };
}

export const jobDetailsData: JobDetailsData = {
  info: {
    hospitalIcon: "/svg/hospital-iconn.svg",
    hospitalName: "Narayana Hospital",
    jobTitle: "Nurse"
  },
  grid: {
    location: "Toronto, ON",
    experience: "2-3+ Years",
    jobType: "Full Time",
    salary: "$12k - $15k"
  },
  contact: {
    email: "narayanehealth@gmail.com",
    phone: "+022 7647 7363",
    website: "www.narayanehealth.com"
  },
  content: {
    description: "Lorem ipsum dolor sit amet consectetur. Fusce volutpat nec placerat faucibus in tellus et mattis. Dooer elementum quis aliquam neque. Elementum maecenas vitae locus laoreet eu. Aliquam egestas vel diam etiam purus. Imperdiet commodo pellentesque neque nontius placerat fringilla sapien ac nulla. Quis scelerisque metus etiam tortor. Feugiat arcu vitae ultaricomplor mincius vesibuium interdum. Neque felis ultricies ut dolor faucibus.",
    specializations: [
      "Cardiology",
      "Cardiology",
      "Orthopaedics",
      "Cardiology",
      "Orthopaedics",
      "Neurology"
    ],
    qualifications: [
      "Cardiology",
      "Cardiology",
      "Orthopaedics",
      "Cardiology",
      "Orthopaedics",
      "Neurology"
    ],
    interviewQuestions: [
      {
        topic: "Questions Topic 1",
        questions: [
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?",
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?",
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?",
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?"
        ]
      },
      {
        topic: "Questions Topic 2",
        questions: [
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?",
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?",
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?",
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?"
        ]
      },
      {
        topic: "Questions Topic 3",
        questions: [
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?",
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?",
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?",
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?"
        ]
      },
      {
        topic: "Questions Topic 4",
        questions: [
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?",
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?",
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?",
          "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?"
        ]
      }
    ]
  }
};

