export const INTERVIEW_QUESTIONS: Record<string, { hr: string[]; technical: string[] }> = {
  frontend: {
    hr: [
      "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
      "Describe a project where you had to meet a tight deadline. How did you manage your time and priorities?",
      "How do you stay updated with the latest technologies and trends in frontend development?",
      "Can you share an example of when you received critical feedback? How did you respond to it?",
      "Tell me about your greatest achievement in your previous role and what made you proud of it.",
    ],
    technical: [
      "Explain the difference between var, let, and const in JavaScript and when you would use each one.",
      "What is the virtual DOM in React? How does it improve performance compared to direct DOM manipulation?",
      "How would you optimize the performance of a slow React application? What tools would you use?",
      "Explain CSS Flexbox and CSS Grid. When would you use each one in your projects?",
      "What is the difference between synchronous and asynchronous JavaScript? Provide examples of each.",
    ],
  },
  backend: {
    hr: [
      "Tell me about a challenging bug you encountered. How did you debug and resolve it?",
      "Describe a situation where you had to mentor a junior developer. What was your approach?",
      "How do you approach writing clean and maintainable code? What practices do you follow?",
      "Tell me about a time when you had to make a difficult technical decision. What factors did you consider?",
      "How do you handle working under pressure with multiple deadlines? Give me an example.",
    ],
    technical: [
      "Explain the concept of RESTful APIs. What are the key principles and HTTP methods used?",
      "What is the difference between SQL and NoSQL databases? When would you use each one?",
      "How would you design a scalable backend system that handles millions of requests per day?",
      "Explain database indexing and its importance. What are the types of indexes and when to use them?",
      "What is the purpose of middleware in backend frameworks? Can you provide examples?",
    ],
  },
  fullstack: {
    hr: [
      "Describe your experience with the full development lifecycle. What challenges did you face?",
      "How do you ensure good communication between frontend and backend teams in your projects?",
      "Tell me about a project where you had to wear multiple hats. How did you manage?",
      "What is your approach to problem-solving when something breaks in production?",
      "Describe a time when you had to learn a new technology quickly to complete a project.",
    ],
    technical: [
      "Design a URL shortening service. What would be your architecture and database schema?",
      "Explain the MVC (Model-View-Controller) architecture and how it applies to full-stack development.",
      "What are the best practices for securing a full-stack application against common vulnerabilities?",
      "How would you implement real-time notifications in a full-stack application?",
      "Describe your approach to testing a full-stack application. What types of tests do you write?",
    ],
  },
  "data-science": {
    hr: [
      "Tell me about a data science project that had significant business impact. What was your role?",
      "How do you explain complex statistical concepts to non-technical stakeholders?",
      "Describe a situation where your data analysis revealed unexpected insights. How did you present them?",
      "Tell me about a time when your model didn't perform as expected. How did you handle it?",
      "How do you stay current with advancements in machine learning and data science?",
    ],
    technical: [
      "Explain the difference between supervised and unsupervised learning. Provide examples of each.",
      "What is the difference between accuracy and precision in classification models? Why are both important?",
      "How would you handle missing data in a dataset? What strategies would you consider?",
      "Explain feature engineering. Why is it important and what techniques do you commonly use?",
      "Describe the steps you would take to build and evaluate a machine learning model from scratch.",
    ],
  },
  devops: {
    hr: [
      "Tell me about your experience with deployment pipelines. What challenges have you overcome?",
      "How do you approach documentation and knowledge sharing in your DevOps practices?",
      "Describe a critical incident you handled. How did you respond and what did you learn?",
      "Tell me about a process improvement you implemented that saved time or reduced errors.",
      "How do you collaborate with development teams to ensure smooth deployments?",
    ],
    technical: [
      "Explain the concept of Infrastructure as Code (IaC). What are the benefits and tools you use?",
      "What is Docker and how does it benefit the deployment process? How is it different from VMs?",
      "Explain Kubernetes. What problems does it solve and what are its main components?",
      "How would you set up a CI/CD pipeline? What tools would you use and why?",
      "Describe your monitoring and alerting strategy. What metrics do you track and tools do you use?",
    ],
  },
  qa: {
    hr: [
      "Tell me about a critical bug you found before it reached production. How did you discover it?",
      "How do you approach communication with development teams when reporting bugs?",
      "Describe your experience with working in an Agile testing environment.",
      "Tell me about a time when testing requirements were unclear. How did you clarify them?",
      "How do you prioritize testing efforts when you have limited time before release?",
    ],
    technical: [
      "Explain the difference between manual testing and automated testing. When would you use each?",
      "What is the test pyramid and how does it guide your testing strategy?",
      "How would you design comprehensive test cases for a complex feature?",
      "Describe your experience with API testing. What tools do you use and what should you test?",
      "Explain the concept of test coverage. How much coverage is enough and how do you measure it?",
    ],
  },
};

export function getQuestionsByDomain(domain: string): { hr: string[]; technical: string[] } {
  const normalizedDomain = domain.toLowerCase().replace(/\s+/g, "-");
  return (
    INTERVIEW_QUESTIONS[normalizedDomain] || {
      hr: [
        "Tell me about your professional background and why you're interested in this role.",
        "How do you handle challenging situations at work?",
        "What are your strengths and how have you leveraged them in your career?",
        "Tell me about a time when you had to collaborate with others to achieve a goal.",
        "Where do you see yourself in 5 years?",
      ],
      technical: [
        "What is your experience with the main technologies for this role?",
        "Describe your approach to problem-solving and learning new technologies.",
        "How do you ensure code quality and maintainability?",
        "Tell me about your experience with testing and debugging.",
        "What is a project you're particularly proud of and why?",
      ],
    }
  );
}
