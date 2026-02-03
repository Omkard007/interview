# Interview Questions Database

This document provides a complete reference of all hardcoded interview questions by domain. Each domain has 5 HR questions and 5 technical questions.

## Domains Available

1. **Frontend** - React, HTML, CSS, JavaScript
2. **Backend** - APIs, Databases, Server Architecture
3. **Full Stack** - Complete Application Development
4. **Data Science** - Machine Learning, Statistics, Data Analysis
5. **DevOps** - Infrastructure, Deployment, Monitoring
6. **QA** - Testing, Quality Assurance, Test Automation

---

## Frontend

### HR Questions
1. Tell me about a time when you had to work with a difficult team member. How did you handle the situation?
2. Describe a project where you had to meet a tight deadline. How did you manage your time and priorities?
3. How do you stay updated with the latest technologies and trends in frontend development?
4. Can you share an example of when you received critical feedback? How did you respond to it?
5. Tell me about your greatest achievement in your previous role and what made you proud of it.

### Technical Questions
1. Explain the difference between var, let, and const in JavaScript and when you would use each one.
2. What is the virtual DOM in React? How does it improve performance compared to direct DOM manipulation?
3. How would you optimize the performance of a slow React application? What tools would you use?
4. Explain CSS Flexbox and CSS Grid. When would you use each one in your projects?
5. What is the difference between synchronous and asynchronous JavaScript? Provide examples of each.

---

## Backend

### HR Questions
1. Tell me about a challenging bug you encountered. How did you debug and resolve it?
2. Describe a situation where you had to mentor a junior developer. What was your approach?
3. How do you approach writing clean and maintainable code? What practices do you follow?
4. Tell me about a time when you had to make a difficult technical decision. What factors did you consider?
5. How do you handle working under pressure with multiple deadlines? Give me an example.

### Technical Questions
1. Explain the concept of RESTful APIs. What are the key principles and HTTP methods used?
2. What is the difference between SQL and NoSQL databases? When would you use each one?
3. How would you design a scalable backend system that handles millions of requests per day?
4. Explain database indexing and its importance. What are the types of indexes and when to use them?
5. What is the purpose of middleware in backend frameworks? Can you provide examples?

---

## Full Stack

### HR Questions
1. Describe your experience with the full development lifecycle. What challenges did you face?
2. How do you ensure good communication between frontend and backend teams in your projects?
3. Tell me about a project where you had to wear multiple hats. How did you manage?
4. What is your approach to problem-solving when something breaks in production?
5. Describe a time when you had to learn a new technology quickly to complete a project.

### Technical Questions
1. Design a URL shortening service. What would be your architecture and database schema?
2. Explain the MVC (Model-View-Controller) architecture and how it applies to full-stack development.
3. What are the best practices for securing a full-stack application against common vulnerabilities?
4. How would you implement real-time notifications in a full-stack application?
5. Describe your approach to testing a full-stack application. What types of tests do you write?

---

## Data Science

### HR Questions
1. Tell me about a data science project that had significant business impact. What was your role?
2. How do you explain complex statistical concepts to non-technical stakeholders?
3. Describe a situation where your data analysis revealed unexpected insights. How did you present them?
4. Tell me about a time when your model didn't perform as expected. How did you handle it?
5. How do you stay current with advancements in machine learning and data science?

### Technical Questions
1. Explain the difference between supervised and unsupervised learning. Provide examples of each.
2. What is the difference between accuracy and precision in classification models? Why are both important?
3. How would you handle missing data in a dataset? What strategies would you consider?
4. Explain feature engineering. Why is it important and what techniques do you commonly use?
5. Describe the steps you would take to build and evaluate a machine learning model from scratch.

---

## DevOps

### HR Questions
1. Tell me about your experience with deployment pipelines. What challenges have you overcome?
2. How do you approach documentation and knowledge sharing in your DevOps practices?
3. Describe a critical incident you handled. How did you respond and what did you learn?
4. Tell me about a process improvement you implemented that saved time or reduced errors.
5. How do you collaborate with development teams to ensure smooth deployments?

### Technical Questions
1. Explain the concept of Infrastructure as Code (IaC). What are the benefits and tools you use?
2. What is Docker and how does it benefit the deployment process? How is it different from VMs?
3. Explain Kubernetes. What problems does it solve and what are its main components?
4. How would you set up a CI/CD pipeline? What tools would you use and why?
5. Describe your monitoring and alerting strategy. What metrics do you track and tools do you use?

---

## QA

### HR Questions
1. Tell me about a critical bug you found before it reached production. How did you discover it?
2. How do you approach communication with development teams when reporting bugs?
3. Describe your experience with working in an Agile testing environment.
4. Tell me about a time when testing requirements were unclear. How did you clarify them?
5. How do you prioritize testing efforts when you have limited time before release?

### Technical Questions
1. Explain the difference between manual testing and automated testing. When would you use each?
2. What is the test pyramid and how does it guide your testing strategy?
3. How would you design comprehensive test cases for a complex feature?
4. Describe your experience with API testing. What tools do you use and what should you test?
5. Explain the concept of test coverage. How much coverage is enough and how do you measure it?

---

## Question Selection Logic

When a user starts an interview:

1. The domain is selected from the homepage
2. Questions are loaded directly from `lib/questions-db.ts`
3. All 5 HR questions + 5 Technical questions are presented in sequence
4. Answers are evaluated using intelligent scoring based on:
   - Answer length (word count)
   - Quality indicators (use of examples, specific details, challenges, solutions)
   - Depth of understanding demonstrated
5. Each answer receives a score from 1-10 with personalized feedback

## How to Modify Questions

To change or add questions:

1. Open `lib/questions-db.ts`
2. Edit the `INTERVIEW_QUESTIONS` object
3. Update the appropriate domain's `hr` or `technical` array
4. Save the file - changes take effect immediately on next interview

No API calls are made - everything is local and instant!
