// Consolidated 7 main tech skill categories

export const skillCategories = {
  'Full-Stack Development': {
    icon: '💻',
    color: 'blue',
    description: 'Frontend, Backend, and Web Development',
    skills: [
      // Programming Languages
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'C', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust',
      'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB', 'Perl', 'Lua', 'Haskell', 'Elixir',
      'Clojure', 'F#', 'Objective-C', 'Visual Basic', 'Assembly', 'SQL', 'Shell Scripting', 'Bash', 'PowerShell',
      
      // Frontend
      'HTML', 'CSS', 'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'jQuery',
      'Bootstrap', 'Tailwind CSS', 'Material-UI', 'Sass', 'LESS', 'Webpack', 'Vite', 'Parcel',
      'Gulp', 'Grunt', 'Redux', 'MobX', 'Zustand', 'Recoil', 'D3.js', 'Three.js', 'Chart.js',
      'Web Components', 'Progressive Web Apps', 'Responsive Design', 'Web Accessibility',
      
      // Backend
      'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET',
      'Ruby on Rails', 'Laravel', 'Symfony', 'NestJS', 'Koa', 'Fastify', 'GraphQL',
      'REST API', 'WebSockets', 'Socket.io', 'gRPC', 'Microservices', 'Serverless',
    ]
  },
  
  'Mobile & Cross-Platform': {
    icon: '📱',
    color: 'purple',
    description: 'Mobile App Development',
    skills: [
      'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Xamarin',
      'Ionic', 'SwiftUI', 'Jetpack Compose', 'Cordova', 'Capacitor',
    ]
  },
  
  'Data & AI': {
    icon: '🤖',
    color: 'green',
    description: 'Data Science, AI, Machine Learning & Databases',
    skills: [
      // Databases
      'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'Redis', 'Cassandra', 'Oracle',
      'Microsoft SQL Server', 'MariaDB', 'DynamoDB', 'Firebase', 'Supabase',
      'Elasticsearch', 'Neo4j', 'CouchDB', 'InfluxDB', 'TimescaleDB',
      
      // Data Science & AI
      'Machine Learning', 'Deep Learning', 'Neural Networks', 'TensorFlow', 'PyTorch',
      'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Natural Language Processing',
      'Computer Vision', 'Data Analysis', 'Data Visualization', 'Big Data', 'Apache Spark',
      'Hadoop', 'Tableau', 'Power BI', 'Jupyter', 'OpenCV', 'NLTK', 'Transformers', 'LangChain',
    ]
  },
  
  'Cloud & Infrastructure': {
    icon: '☁️',
    color: 'cyan',
    description: 'DevOps, Cloud Computing & Infrastructure',
    skills: [
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI/CD',
      'GitHub Actions', 'CircleCI', 'Travis CI', 'Terraform', 'Ansible', 'Chef', 'Puppet',
      'Vagrant', 'Nginx', 'Apache', 'Linux', 'Unix', 'CI/CD', 'Infrastructure as Code',
    ]
  },
  
  'Security & Blockchain': {
    icon: '🔐',
    color: 'red',
    description: 'Cybersecurity, Blockchain & Web3',
    skills: [
      // Cybersecurity
      'Ethical Hacking', 'Penetration Testing', 'Network Security', 'Web Security',
      'Cryptography', 'Cybersecurity', 'Security Auditing', 'Vulnerability Assessment',
      'OWASP', 'Kali Linux', 'Metasploit', 'Wireshark', 'Burp Suite', 'Nmap',
      
      // Blockchain
      'Blockchain', 'Ethereum', 'Solidity', 'Smart Contracts', 'Web3.js',
      'Cryptocurrency', 'DeFi', 'NFT Development', 'Hyperledger',
    ]
  },
  
  'Creative & Gaming': {
    icon: '🎮',
    color: 'pink',
    description: 'Game Development, Design & UI/UX',
    skills: [
      // Game Development
      'Unity', 'Unreal Engine', 'Godot', 'Game Design', 'Blender', '3D Modeling',
      'Animation', 'Game Physics', 'Shader Programming',
      
      // Design & UI/UX
      'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
      'InDesign', 'Wireframing', 'Prototyping', 'User Research', 'Interaction Design',
      'Visual Design', 'Design Systems',
    ]
  },
  
  'Quality & Collaboration': {
    icon: '🛠️',
    color: 'yellow',
    description: 'Testing, Version Control & Best Practices',
    skills: [
      // Version Control
      'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial', 'Code Review',
      'Agile', 'Scrum', 'Jira', 'Confluence', 'Trello',
      
      // Testing
      'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium', 'Playwright', 'Unit Testing',
      'Integration Testing', 'End-to-End Testing', 'Test-Driven Development',
      'Behavior-Driven Development', 'JUnit', 'PyTest', 'TestNG',
      
      // Other
      'Arduino', 'Raspberry Pi', 'IoT', 'Embedded Systems', 'AR/VR Development',
      'Quantum Computing', 'Edge Computing', 'API Development', 'Webscraping',
      'Automation', 'Performance Optimization', 'SEO', 'Content Management Systems',
      'WordPress', 'Shopify', 'E-commerce', 'Payment Integration', 'OAuth',
      'Authentication', 'Authorization', 'System Design', 'Software Architecture',
      'Design Patterns', 'Clean Code', 'Refactoring', 'Technical Writing',
      'Documentation', 'Open Source', 'Pair Programming', 'Code Debugging',
      'Problem Solving', 'Algorithms', 'Data Structures', 'Object-Oriented Programming',
      'Functional Programming', 'Concurrent Programming', 'Asynchronous Programming',
    ]
  }
};

// Helper function to get category for a skill
export const getCategoryForSkill = (skill) => {
  for (const [categoryName, categoryData] of Object.entries(skillCategories)) {
    if (categoryData.skills.includes(skill)) {
      return categoryName;
    }
  }
  return 'Quality & Collaboration'; // Default category
};

// Get all category names
export const getCategoryNames = () => Object.keys(skillCategories);

export default skillCategories;
