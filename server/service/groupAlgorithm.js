// Group assignment algorithm

const skillCategories = {
  'Full-Stack Development': {
    icon: '💻',
    color: 'blue',
    description: 'Frontend, Backend, and Web Development',
    skills: [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'C', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust',
      'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB', 'Perl', 'Lua', 'Haskell', 'Elixir',
      'Clojure', 'F#', 'Objective-C', 'Visual Basic', 'Assembly', 'SQL', 'Shell Scripting', 'Bash', 'PowerShell',
      'HTML', 'CSS', 'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'jQuery',
      'Bootstrap', 'Tailwind CSS', 'Material-UI', 'Sass', 'LESS', 'Webpack', 'Vite', 'Parcel',
      'Gulp', 'Grunt', 'Redux', 'MobX', 'Zustand', 'Recoil', 'D3.js', 'Three.js', 'Chart.js',
      'Web Components', 'Progressive Web Apps', 'Responsive Design', 'Web Accessibility',
      'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET',
      'Ruby on Rails', 'Laravel', 'Symfony', 'NestJS', 'Koa', 'Fastify', 'GraphQL',
      'REST API', 'WebSockets', 'Socket.io', 'gRPC', 'Microservices', 'Serverless',
      'Web Development', 'Frontend Development', 'Backend Development', 'Full Stack',
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
      'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'Redis', 'Cassandra', 'Oracle',
      'Microsoft SQL Server', 'MariaDB', 'DynamoDB', 'Firebase', 'Supabase',
      'Elasticsearch', 'Neo4j', 'CouchDB', 'InfluxDB', 'TimescaleDB',
      'Machine Learning', 'Deep Learning', 'Neural Networks', 'TensorFlow', 'PyTorch',
      'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Natural Language Processing',
      'Computer Vision', 'Data Analysis', 'Data Visualization', 'Big Data', 'Apache Spark',
      'Hadoop', 'Tableau', 'Power BI', 'Jupyter', 'OpenCV', 'NLTK', 'Transformers', 'LangChain',
      'Artificial Intelligence', 'AI', 'Data Science', 'ML',
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
      'Ethical Hacking', 'Penetration Testing', 'Network Security', 'Web Security',
      'Cryptography', 'Cybersecurity', 'Security Auditing', 'Vulnerability Assessment',
      'OWASP', 'Kali Linux', 'Metasploit', 'Wireshark', 'Burp Suite', 'Nmap',
      'Blockchain', 'Ethereum', 'Solidity', 'Smart Contracts', 'Web3.js',
      'Cryptocurrency', 'DeFi', 'NFT Development', 'Hyperledger',
    ]
  },
  'Creative & Gaming': {
    icon: '🎮',
    color: 'pink',
    description: 'Game Development, Design & UI/UX',
    skills: [
      'Unity', 'Unreal Engine', 'Godot', 'Game Design', 'Blender', '3D Modeling',
      'Animation', 'Game Physics', 'Shader Programming',
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
      'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial', 'Code Review',
      'Agile', 'Scrum', 'Jira', 'Confluence', 'Trello',
      'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium', 'Playwright', 'Unit Testing',
      'Integration Testing', 'End-to-End Testing', 'Test-Driven Development',
      'Behavior-Driven Development', 'JUnit', 'PyTest', 'TestNG',
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

const getCategoryForSkill = (skill) => {
  // Normalize skill for case-insensitive matching
  const normalizedSkill = skill.trim();
  
  for (const [categoryName, categoryData] of Object.entries(skillCategories)) {
    // Case-insensitive comparison
    const found = categoryData.skills.find(s => s.toLowerCase() === normalizedSkill.toLowerCase());
    if (found) {
      return categoryName;
    }
  }
  return 'Quality & Collaboration';
};

const assignUserToGroups = (user) => {
  // Combine skills they have and skills they want to learn
  const userSkills = [...(user.skillsHave || []), ...(user.skillsWant || [])];
  
  // If user has no skills at all, return empty (don't assign to any group)
  if (userSkills.length === 0) {
    return [];
  }
  
  const categories = new Set();
  
  // Find all categories user belongs to based on their skills
  userSkills.forEach(skill => {
    const category = getCategoryForSkill(skill);
    if (category) {
      categories.add(category);
    }
  });
  
  // Return all matching categories (user can be in multiple groups)
  return Array.from(categories);
};

module.exports = {
  skillCategories,
  getCategoryForSkill,
  assignUserToGroups
};
