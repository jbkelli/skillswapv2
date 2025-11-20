// Quiz questions for each group category
const quizQuestions = {
  'Full-Stack Development': [
    {
      question: 'What does REST stand for in web development?',
      options: ['Representational State Transfer', 'Remote Execution State Transfer', 'Relational Execution State Transfer', 'Real-time Execution State Transfer'],
      correctAnswer: 0
    },
    {
      question: 'Which HTTP method is used to update existing data?',
      options: ['POST', 'GET', 'PUT', 'DELETE'],
      correctAnswer: 2
    },
    {
      question: 'What is the Virtual DOM in React?',
      options: ['A database', 'A lightweight copy of the actual DOM', 'A CSS framework', 'A testing library'],
      correctAnswer: 1
    },
    {
      question: 'What does SQL stand for?',
      options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language'],
      correctAnswer: 0
    },
    {
      question: 'Which of these is NOT a JavaScript framework?',
      options: ['React', 'Vue', 'Angular', 'Django'],
      correctAnswer: 3
    },
    {
      question: 'What is middleware in Express.js?',
      options: ['A database', 'Functions that execute during request-response cycle', 'A front-end library', 'A testing tool'],
      correctAnswer: 1
    },
    {
      question: 'What does MVC stand for?',
      options: ['Model View Controller', 'Multiple View Controller', 'Model Virtual Controller', 'Maximum View Control'],
      correctAnswer: 0
    },
    {
      question: 'Which database is document-oriented?',
      options: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite'],
      correctAnswer: 2
    },
    {
      question: 'What is CORS?',
      options: ['Cross-Origin Resource Sharing', 'Common Object Request System', 'Client-Origin Resource System', 'Cross-Object Render Sharing'],
      correctAnswer: 0
    },
    {
      question: 'What is the purpose of package.json?',
      options: ['Store images', 'Manage project dependencies and scripts', 'Configure database', 'Handle authentication'],
      correctAnswer: 1
    },
    {
      question: 'What does API stand for?',
      options: ['Application Programming Interface', 'Advanced Programming Interface', 'Application Process Integration', 'Automated Programming Interface'],
      correctAnswer: 0
    },
    {
      question: 'Which is a CSS preprocessor?',
      options: ['React', 'Sass', 'Express', 'MongoDB'],
      correctAnswer: 1
    }
  ],
  'Mobile & Cross-Platform': [
    {
      question: 'Which framework allows you to build mobile apps using JavaScript?',
      options: ['Django', 'Flask', 'React Native', 'Laravel'],
      correctAnswer: 2
    },
    {
      question: 'What is Flutter primarily built with?',
      options: ['JavaScript', 'Python', 'Dart', 'Java'],
      correctAnswer: 2
    },
    {
      question: 'Which company developed React Native?',
      options: ['Google', 'Facebook', 'Apple', 'Microsoft'],
      correctAnswer: 1
    },
    {
      question: 'What is Xamarin used for?',
      options: ['Web development', 'Cross-platform mobile development', 'Database management', 'Game development'],
      correctAnswer: 1
    },
    {
      question: 'Which language is native to iOS development?',
      options: ['Java', 'Kotlin', 'Swift', 'C#'],
      correctAnswer: 2
    },
    {
      question: 'What is the native language for Android development?',
      options: ['Swift', 'Kotlin', 'Python', 'Ruby'],
      correctAnswer: 1
    },
    {
      question: 'Which tool is used to test mobile apps on different devices?',
      options: ['Emulator', 'Compiler', 'Interpreter', 'Debugger'],
      correctAnswer: 0
    },
    {
      question: 'What does APK stand for?',
      options: ['Android Package Kit', 'Application Program Kit', 'Android Processing Kit', 'App Package Key'],
      correctAnswer: 0
    },
    {
      question: 'Which is a popular state management library for React Native?',
      options: ['Express', 'Redux', 'Django', 'Flask'],
      correctAnswer: 1
    },
    {
      question: 'What is Expo in React Native?',
      options: ['A database', 'A development platform and toolchain', 'A testing framework', 'A UI library'],
      correctAnswer: 1
    },
    {
      question: 'Which company created Flutter?',
      options: ['Facebook', 'Apple', 'Google', 'Microsoft'],
      correctAnswer: 2
    },
    {
      question: 'What is PWA?',
      options: ['Progressive Web App', 'Private Web Application', 'Public Web API', 'Portable Web App'],
      correctAnswer: 0
    }
  ],
  'Data & AI': [
    {
      question: 'What does AI stand for?',
      options: ['Artificial Intelligence', 'Automated Intelligence', 'Advanced Intelligence', 'Applied Intelligence'],
      correctAnswer: 0
    },
    {
      question: 'Which Python library is commonly used for machine learning?',
      options: ['React', 'scikit-learn', 'Express', 'jQuery'],
      correctAnswer: 1
    },
    {
      question: 'What is supervised learning?',
      options: ['Learning without labels', 'Learning with labeled training data', 'Learning by trial and error', 'Learning without data'],
      correctAnswer: 1
    },
    {
      question: 'What does NLP stand for?',
      options: ['Natural Language Processing', 'Network Layer Protocol', 'New Learning Process', 'Neural Logic Programming'],
      correctAnswer: 0
    },
    {
      question: 'Which is a popular deep learning framework?',
      options: ['TensorFlow', 'Bootstrap', 'Laravel', 'WordPress'],
      correctAnswer: 0
    },
    {
      question: 'What is a neural network?',
      options: ['A database', 'A computing system inspired by biological neural networks', 'A web framework', 'A cloud service'],
      correctAnswer: 1
    },
    {
      question: 'What does CSV stand for?',
      options: ['Computer System Values', 'Comma-Separated Values', 'Central System Variables', 'Code Structure Values'],
      correctAnswer: 1
    },
    {
      question: 'Which language is most popular for data science?',
      options: ['HTML', 'CSS', 'Python', 'PHP'],
      correctAnswer: 2
    },
    {
      question: 'What is pandas in Python?',
      options: ['A game', 'A data manipulation library', 'A web framework', 'An operating system'],
      correctAnswer: 1
    },
    {
      question: 'What is overfitting in machine learning?',
      options: ['Model performs too well on training data but poorly on new data', 'Model is too simple', 'Model has no errors', 'Model trains too quickly'],
      correctAnswer: 0
    },
    {
      question: 'What does GPU acceleration help with in AI?',
      options: ['Storing data', 'Faster parallel computations', 'Writing code', 'Managing databases'],
      correctAnswer: 1
    },
    {
      question: 'What is regression in machine learning?',
      options: ['Classification task', 'Predicting continuous values', 'Clustering task', 'Data cleaning'],
      correctAnswer: 1
    }
  ],
  'Cloud & Infrastructure': [
    {
      question: 'What does AWS stand for?',
      options: ['Amazon Web Services', 'Advanced Web Services', 'Automated Web System', 'Amazon World Services'],
      correctAnswer: 0
    },
    {
      question: 'Which is a container orchestration platform?',
      options: ['MySQL', 'Kubernetes', 'MongoDB', 'React'],
      correctAnswer: 1
    },
    {
      question: 'What does CI/CD stand for?',
      options: ['Continuous Integration/Continuous Deployment', 'Computer Integration/Code Deployment', 'Central Integration/Cloud Deployment', 'Code Integration/Container Development'],
      correctAnswer: 0
    },
    {
      question: 'Which is a cloud service provider?',
      options: ['jQuery', 'Azure', 'Bootstrap', 'Laravel'],
      correctAnswer: 1
    },
    {
      question: 'What is Docker used for?',
      options: ['Database management', 'Containerization', 'Front-end development', 'Image editing'],
      correctAnswer: 1
    },
    {
      question: 'What does IaaS stand for?',
      options: ['Infrastructure as a Service', 'Internet as a Service', 'Integration as a Service', 'Interface as a Service'],
      correctAnswer: 0
    },
    {
      question: 'Which is a version control system?',
      options: ['MongoDB', 'Git', 'React', 'Express'],
      correctAnswer: 1
    },
    {
      question: 'What is serverless computing?',
      options: ['Computing without servers', 'Cloud provider manages server infrastructure', 'Local computing only', 'Offline computing'],
      correctAnswer: 1
    },
    {
      question: 'What does VPC stand for in cloud computing?',
      options: ['Virtual Private Cloud', 'Very Private Computing', 'Virtual Public Cloud', 'Variable Private Container'],
      correctAnswer: 0
    },
    {
      question: 'Which tool is used for infrastructure as code?',
      options: ['React', 'Terraform', 'jQuery', 'Bootstrap'],
      correctAnswer: 1
    },
    {
      question: 'What is load balancing?',
      options: ['Distributing traffic across multiple servers', 'Compressing files', 'Encrypting data', 'Backing up data'],
      correctAnswer: 0
    },
    {
      question: 'What does CDN stand for?',
      options: ['Content Delivery Network', 'Central Data Network', 'Cloud Distribution Network', 'Computer Data Network'],
      correctAnswer: 0
    }
  ],
  'Security & Blockchain': [
    {
      question: 'What does HTTPS stand for?',
      options: ['HyperText Transfer Protocol Secure', 'High Transfer Protocol System', 'HyperText Transmission Protocol Safe', 'High-Tech Transfer Protocol Secure'],
      correctAnswer: 0
    },
    {
      question: 'What is encryption?',
      options: ['Deleting data', 'Converting data into coded form', 'Backing up data', 'Compressing data'],
      correctAnswer: 1
    },
    {
      question: 'What is a blockchain?',
      options: ['A database', 'A distributed ledger technology', 'A programming language', 'A cloud service'],
      correctAnswer: 1
    },
    {
      question: 'What does 2FA stand for?',
      options: ['Two-Factor Authentication', 'Two-File Application', 'Twin-Form Authorization', 'Two-Field Analysis'],
      correctAnswer: 0
    },
    {
      question: 'What is a smart contract?',
      options: ['A legal document', 'Self-executing code on blockchain', 'A database', 'An API'],
      correctAnswer: 1
    },
    {
      question: 'What is SQL injection?',
      options: ['A security vulnerability', 'A database feature', 'A programming language', 'A cloud service'],
      correctAnswer: 0
    },
    {
      question: 'What does SSL stand for?',
      options: ['Secure System Layer', 'Secure Sockets Layer', 'System Security Layer', 'Safe Socket Link'],
      correctAnswer: 1
    },
    {
      question: 'What is cryptocurrency?',
      options: ['Physical money', 'Digital currency using cryptography', 'Credit card', 'Bank account'],
      correctAnswer: 1
    },
    {
      question: 'What is hashing?',
      options: ['Encrypting files', 'Converting data to fixed-size string', 'Deleting data', 'Compressing data'],
      correctAnswer: 1
    },
    {
      question: 'What is Ethereum?',
      options: ['A programming language', 'A blockchain platform', 'A database', 'A web framework'],
      correctAnswer: 1
    },
    {
      question: 'What does XSS stand for?',
      options: ['Cross-Site Scripting', 'Extra System Security', 'External Style Sheets', 'Extended Server System'],
      correctAnswer: 0
    },
    {
      question: 'What is a firewall?',
      options: ['A database', 'Network security system', 'Programming language', 'Cloud service'],
      correctAnswer: 1
    }
  ],
  'Creative & Gaming': [
    {
      question: 'Which engine is popular for game development?',
      options: ['MySQL', 'Unity', 'Express', 'Django'],
      correctAnswer: 1
    },
    {
      question: 'What does FPS stand for in gaming?',
      options: ['First Person Shooter', 'Frames Per Second', 'Both A and B', 'File Processing System'],
      correctAnswer: 2
    },
    {
      question: 'Which software is used for 3D modeling?',
      options: ['Photoshop', 'Blender', 'Excel', 'Word'],
      correctAnswer: 1
    },
    {
      question: 'What is Unreal Engine used for?',
      options: ['Data analysis', 'Game development', 'Web hosting', 'Database management'],
      correctAnswer: 1
    },
    {
      question: 'Which language does Unity primarily use?',
      options: ['Python', 'C#', 'Ruby', 'PHP'],
      correctAnswer: 1
    },
    {
      question: 'What is a sprite in game development?',
      options: ['A 3D model', '2D image or animation', 'A sound effect', 'A game level'],
      correctAnswer: 1
    },
    {
      question: 'What does UI stand for in game design?',
      options: ['User Interface', 'Unity Integration', 'Universal Input', 'Unreal Interface'],
      correctAnswer: 0
    },
    {
      question: 'Which is a vector graphics editor?',
      options: ['Photoshop', 'Adobe Illustrator', 'Excel', 'PowerPoint'],
      correctAnswer: 1
    },
    {
      question: 'What is rigging in 3D animation?',
      options: ['Coloring models', 'Creating skeletal structure for animation', 'Rendering scenes', 'Texturing objects'],
      correctAnswer: 1
    },
    {
      question: 'What does VFX stand for?',
      options: ['Virtual Fixed X-ray', 'Visual Effects', 'Video Format XML', 'Very Fast eXecution'],
      correctAnswer: 1
    },
    {
      question: 'Which file format is commonly used for 3D models?',
      options: ['.jpg', '.obj', '.txt', '.csv'],
      correctAnswer: 1
    },
    {
      question: 'What is procedural generation in games?',
      options: ['Manual level design', 'Algorithmic content creation', 'Player input', 'Bug fixing'],
      correctAnswer: 1
    }
  ],
  'Quality & Collaboration': [
    {
      question: 'What does QA stand for?',
      options: ['Quality Assurance', 'Quick Application', 'Query Analysis', 'Quantum Algorithm'],
      correctAnswer: 0
    },
    {
      question: 'Which is a version control platform?',
      options: ['MongoDB', 'GitHub', 'MySQL', 'Redis'],
      correctAnswer: 1
    },
    {
      question: 'What is unit testing?',
      options: ['Testing entire application', 'Testing individual components', 'Testing hardware', 'Testing networks'],
      correctAnswer: 1
    },
    {
      question: 'What does PR stand for in GitHub?',
      options: ['Public Repository', 'Pull Request', 'Private Release', 'Project Review'],
      correctAnswer: 1
    },
    {
      question: 'Which is a project management methodology?',
      options: ['HTML', 'Agile', 'CSS', 'SQL'],
      correctAnswer: 1
    },
    {
      question: 'What is code review?',
      options: ['Deleting code', 'Examining code for quality', 'Writing documentation', 'Deploying code'],
      correctAnswer: 1
    },
    {
      question: 'What does TDD stand for?',
      options: ['Test-Driven Development', 'Technical Design Document', 'Total Data Deployment', 'Time-Delayed Delivery'],
      correctAnswer: 0
    },
    {
      question: 'Which tool is used for continuous integration?',
      options: ['Photoshop', 'Jenkins', 'Excel', 'PowerPoint'],
      correctAnswer: 1
    },
    {
      question: 'What is pair programming?',
      options: ['Two programmers working together', 'Programming alone', 'Testing code', 'Deploying applications'],
      correctAnswer: 0
    },
    {
      question: 'What does API documentation explain?',
      options: ['How to use an API', 'How to design websites', 'How to create databases', 'How to write CSS'],
      correctAnswer: 0
    },
    {
      question: 'What is regression testing?',
      options: ['Testing new features only', 'Re-testing after changes to ensure nothing broke', 'Testing databases', 'Testing networks'],
      correctAnswer: 1
    },
    {
      question: 'What is a sprint in Agile?',
      options: ['A running race', 'A time-boxed development cycle', 'A testing phase', 'A deployment process'],
      correctAnswer: 1
    }
  ]
};

module.exports = quizQuestions;
