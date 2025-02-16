import type { JobRole } from './schema';

export const questions: Record<JobRole, string[]> = {
  "Full Stack Developer": [
    "Explain the difference between server-side and client-side rendering",
    "What are microservices and their benefits?",
    "Describe your experience with RESTful APIs",
    "How do you handle state management in frontend applications?",
    "Explain database indexing and its importance",
    "What is CORS and how do you handle it?",
    "Describe the OAuth 2.0 authentication flow",
    "How do you ensure application security?",
    "Explain Docker and containerization",
    "What CI/CD practices do you follow?"
  ],
  "Data Analyst": [
    "What statistical methods do you commonly use for data analysis?",
    "Explain the difference between correlation and causation",
    "How do you handle missing data?",
    "Describe your experience with SQL",
    "What visualization tools do you prefer and why?",
    "How do you ensure data quality?",
    "Explain A/B testing methodology",
    "What is your approach to data cleaning?",
    "How do you communicate findings to stakeholders?",
    "Describe a challenging data analysis project"
  ],
  "Data Scientist": [
    "Explain different types of machine learning algorithms",
    "How do you handle overfitting?",
    "Describe feature selection methods",
    "What is the difference between supervised and unsupervised learning?",
    "Explain cross-validation",
    "How do you evaluate model performance?",
    "Describe your experience with deep learning",
    "What is the bias-variance tradeoff?",
    "How do you handle imbalanced datasets?",
    "Explain the concept of regularization"
  ],
  "Web Developer": [
    "Explain responsive design principles",
    "What are semantic HTML elements?",
    "Describe CSS positioning methods",
    "How do you optimize website performance?",
    "Explain JavaScript event bubbling",
    "What are Web APIs?",
    "Describe your experience with CSS frameworks",
    "How do you handle browser compatibility?",
    "What is Progressive Web Apps (PWA)?",
    "Explain web accessibility principles"
  ],
  "Java Developer": [
    "Explain Java memory management",
    "What are Java collections?",
    "Describe multithreading in Java",
    "What is Spring Framework?",
    "Explain dependency injection",
    "How do you handle exceptions?",
    "What are Java 8 streams?",
    "Explain JDBC and ORM",
    "Describe design patterns you've used",
    "How do you write unit tests?"
  ],
  "Python Developer": [
    "Explain Python decorators",
    "What are generators in Python?",
    "Describe Python's GIL",
    "How do you handle concurrency?",
    "Explain list comprehensions",
    "What is PIP and virtual environments?",
    "Describe Python's memory management",
    "How do you handle packages?",
    "Explain Python's OOP concepts",
    "What testing frameworks do you use?"
  ],
  "Frontend Developer": [
    "Explain the Virtual DOM",
    "What are React hooks?",
    "Describe state management solutions",
    "How do you handle routing?",
    "Explain CSS-in-JS",
    "What is code splitting?",
    "Describe frontend build tools",
    "How do you optimize performance?",
    "Explain modern CSS features",
    "What is your debugging approach?"
  ],
  "Backend Developer": [
    "Explain database design principles",
    "What is caching and its types?",
    "Describe API authentication methods",
    "How do you handle scalability?",
    "Explain message queues",
    "What is database sharding?",
    "Describe logging and monitoring",
    "How do you handle errors?",
    "Explain backend security practices",
    "What is your API design approach?"
  ]
};
