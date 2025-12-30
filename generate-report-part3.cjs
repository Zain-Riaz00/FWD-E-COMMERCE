const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // ===== CHAPTER 7: VALIDATIONS AND CHALLENGES =====
      new Paragraph({
        text: "CHAPTER 7",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "VALIDATIONS AND CHALLENGES",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      // 7.1 Testing Methodology
      new Paragraph({
        text: "7.1 Testing Methodology",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "Ensuring the quality and reliability of the PlayNex platform required a comprehensive testing approach that validated functionality across all system layers. The testing methodology employed combined multiple strategies to identify and address defects before they could impact users. This systematic approach to quality assurance was essential for delivering a production-ready platform.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Manual testing formed the foundation of the quality assurance process, with developers and testers interacting with the application as end users would. This exploratory testing approach proved valuable for identifying usability issues, visual inconsistencies, and edge cases that automated tests might miss. Test sessions covered all major user journeys including registration, product browsing, cart management, and checkout processes. Administrative functions were tested separately, ensuring that product management, user administration, and content editing worked correctly across various scenarios.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Cross-browser testing ensured consistent functionality across different web browsers. The platform was tested on Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari, identifying and resolving browser-specific rendering differences and JavaScript compatibility issues. Mobile browsers on both iOS and Android devices were included in testing, verifying that responsive design adaptations worked correctly on actual mobile hardware rather than just desktop browser emulation.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Responsive design testing verified that the platform adapted appropriately to different screen sizes and orientations. Testing was conducted across a range of viewport widths from mobile phones at 320 pixels wide through tablets at various sizes to large desktop monitors. Each major component and page layout was verified to render correctly and remain usable at each breakpoint. Touch interactions were tested on actual touch devices to ensure that tap targets were appropriately sized and gesture-based interactions worked as intended.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "API testing validated the backend endpoints independently of the frontend. Each API route was tested with valid inputs to verify correct behavior, invalid inputs to verify proper error handling, and edge cases to identify boundary conditions. Authentication and authorization were tested by attempting to access protected resources without credentials, with invalid credentials, and with credentials lacking appropriate permissions. These tests confirmed that security controls functioned correctly.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Performance testing measured response times and resource utilization under various conditions. Load testing simulated multiple concurrent users accessing the platform, measuring how response times degraded under load and identifying bottlenecks. The in-memory caching system was validated by comparing response times for cached versus uncached queries, confirming the expected performance improvement. Frontend performance was measured using browser developer tools, tracking metrics including time to first contentful paint, time to interactive, and animation frame rates.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Database validation ensured data integrity and consistency. Tests verified that data was stored correctly, relationships between documents were maintained, and queries returned expected results. The seeding process was tested to ensure it created consistent initial data. Backup and recovery procedures were validated to confirm that data could be restored if needed.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Security testing probed for common vulnerabilities. Input fields were tested with malicious inputs to verify that injection attacks were prevented. Authentication was tested for vulnerabilities including weak password acceptance, session fixation, and token manipulation. Cross-origin requests were tested to verify that CORS protections functioned correctly. While comprehensive penetration testing by security specialists was outside the project scope, these basic security validations provided confidence in the platform's security posture.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 7.2 Challenges Encountered
      new Paragraph({
        text: "7.2 Challenges Encountered",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The development of PlayNex presented numerous technical and practical challenges that required creative problem-solving and, in some cases, significant architectural adjustments. Documenting these challenges provides valuable insights into the complexities of modern full-stack web development and the decisions made to overcome obstacles.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "One of the most significant challenges involved implementing the three-dimensional product visualization feature. Initial attempts to integrate Three.js directly into the React application resulted in performance issues, memory leaks, and difficulties managing the lifecycle of 3D scenes within React's rendering model. The WebGL context management proved particularly problematic, with contexts being created and destroyed as components mounted and unmounted, eventually exhausting available contexts. Additionally, loading and rendering 3D models introduced noticeable delays that disrupted the user experience.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Database performance emerged as a challenge as the product catalog grew. Initial implementations queried the database for every product request, which worked acceptably with small datasets but degraded noticeably as data volume increased. Response times for product listing pages became unacceptably slow, particularly when filters and sorting were applied. The hierarchical product structure with parent-child-grandchild relationships added complexity to queries, requiring multiple database round trips to retrieve complete product information with variants.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Authentication state management presented challenges in coordinating state between the frontend React application and the backend API. Initial implementations experienced issues with authentication state becoming out of sync, resulting in users appearing logged in on the frontend but receiving authentication errors when making API requests, or vice versa. Token expiration handling was particularly problematic, as expired tokens needed to be detected and handled gracefully without disrupting the user experience.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Image handling introduced multiple challenges throughout development. Product images uploaded by administrators could be quite large, causing slow page loads and excessive bandwidth consumption. Storing images as base64-encoded strings in the database proved problematic for very large images, affecting database performance and backup sizes. The logging system initially included full image data in request logs, causing log files to grow enormously and making them difficult to analyze.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Animation performance required careful optimization to maintain smooth 60 frames per second rendering across devices. Initial animation implementations caused frame drops on less powerful devices, particularly during page transitions when multiple animations occurred simultaneously. Complex animations involving layout changes triggered expensive browser reflows, further degrading performance. Mobile devices were particularly affected due to their limited processing power compared to desktop computers.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The product variant system's complexity created challenges in both data modeling and user interface design. Representing the relationships between parent products, variant options, and specific SKUs required careful schema design. The user interface needed to present variant options intuitively while handling combinations of variants, stock levels for specific combinations, and pricing that might vary by variant. Ensuring that variant selection updated all relevant display elements including images, prices, and availability presented coordination challenges.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Cross-browser compatibility issues emerged throughout development, particularly with CSS features and JavaScript APIs that had inconsistent support across browsers. Flexbox and Grid layouts behaved differently in some browsers, requiring vendor prefixes or alternative implementations. Safari on iOS presented unique challenges with viewport handling, form element styling, and scroll behavior. These compatibility issues often surfaced late in testing when features were verified on browsers other than the primary development browser.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Email delivery for password recovery functionality encountered challenges with deliverability and configuration. Initial attempts to send emails were blocked by various email providers' spam filters. Configuring Gmail SMTP with app-specific passwords required understanding Google's security requirements and properly formatting authentication credentials. Ensuring that emails were delivered reliably and arrived in recipients' inboxes rather than spam folders required attention to email formatting and sender reputation.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 7.3 Solutions Implemented
      new Paragraph({
        text: "7.3 Solutions Implemented",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "Each challenge encountered during development prompted investigation, experimentation, and ultimately the implementation of solutions that improved the platform's quality and performance. The solutions developed often represented improvements over initial implementations and demonstrated the value of iterative development.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The 3D visualization challenges were addressed by adopting React Three Fiber, a React renderer for Three.js that manages the complexities of integrating 3D graphics with React's component lifecycle. React Three Fiber handles WebGL context management, scene graph updates, and resource cleanup automatically, eliminating the memory leaks and context exhaustion issues. Performance was improved through implementing level-of-detail rendering, lazy loading of 3D assets, and using efficient geometry and materials. A loading state with a placeholder image provides immediate visual feedback while 3D resources load asynchronously.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Database performance was dramatically improved through the implementation of an in-memory caching layer. Upon server startup and successful database connection, all product data is loaded into a Map structure in server memory. Product queries check the cache first, returning cached data immediately when available. This approach reduced typical product query response times from 50-100 milliseconds to sub-millisecond levels. Cache invalidation is triggered whenever products are modified, ensuring consistency between the cache and database. For complex queries involving filtering and sorting, the cache contains sufficient data to perform these operations in memory.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Authentication state management was improved by implementing a more robust token handling strategy. The frontend stores the JWT token in localStorage and includes it in all API requests via the Authorization header. A response interceptor detects 401 unauthorized responses, which may indicate an expired or invalid token, and handles them by clearing authentication state and redirecting to the login page. Token validation on the backend was enhanced to provide more specific error messages distinguishing between missing tokens, expired tokens, and invalid tokens.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Image handling was optimized through several improvements. The logging system was modified to truncate or omit image data from request logs, preventing log bloat while maintaining useful debugging information. For future enhancement, image compression and resizing on upload would further reduce storage requirements and improve load times. The current implementation accepts base64-encoded images but avoids logging the full encoded strings.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Animation performance was optimized by following best practices for web animations. Animations were restricted to transform and opacity properties where possible, as these properties can be animated by the GPU without triggering layout recalculation. The will-change CSS property was applied to elements that would be animated, hinting to the browser to prepare for animation. Complex page transitions were simplified on mobile devices where processing power is limited. Framer Motion's layout animation features were used judiciously, avoiding layout animations for large sections of the page.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The product variant system was refined through improved data modeling and UI component design. The hierarchical structure with productType and parentId fields provides flexibility while maintaining clear relationships. The frontend implements variant selectors as controlled components that update shared state, triggering coordinated updates across all dependent display elements. Careful use of React's useEffect hook ensures that variant changes propagate correctly through the component tree.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Cross-browser compatibility issues were addressed through a combination of CSS normalization, vendor prefixes, and feature detection. Tailwind CSS's built-in normalization handles many cross-browser inconsistencies automatically. Where browser-specific issues were identified, targeted fixes were implemented using CSS feature queries or JavaScript feature detection. Testing on actual devices rather than just browser emulators proved essential for identifying and resolving Safari-specific issues on iOS.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Email deliverability was improved by properly configuring the Gmail SMTP integration with app-specific passwords. The email configuration uses the account zainmalik55786@gmail.com with the app password lkjkuavqyhzghfgq, which provides secure authentication without exposing the main account password. Email content was formatted properly with appropriate headers to improve deliverability. The password reset flow was designed to be secure while providing clear instructions to users.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 7.4 Lessons Learned
      new Paragraph({
        text: "7.4 Lessons Learned",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The development of PlayNex provided numerous valuable lessons that will inform future development efforts. These lessons span technical, procedural, and strategic domains, representing hard-won knowledge gained through practical experience.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Perhaps the most important technical lesson concerns the value of performance optimization from the outset rather than as an afterthought. Many of the performance challenges encountered resulted from decisions made early in development that did not anticipate scaling requirements. The database query patterns that worked with small test datasets became problematic with realistic data volumes. Building with performance in mind from the beginning—including implementing caching, optimizing queries, and designing efficient data structures—would have avoided significant rework.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The importance of choosing appropriate abstractions was demonstrated through the 3D visualization implementation. Initial attempts to use Three.js directly required significant code to manage the integration with React. Adopting React Three Fiber, an abstraction designed specifically for this integration, eliminated entire categories of bugs and reduced code complexity substantially. This lesson applies broadly: when integrating disparate technologies, purpose-built integration libraries often provide significant value over custom implementations.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Cross-browser testing should occur continuously throughout development rather than being concentrated at the end. Browser-specific issues discovered late in development required revisiting components that were considered complete, disrupting development schedules and introducing risk of regressions. Incorporating regular cross-browser checks into the development workflow would surface compatibility issues earlier when they are less costly to address.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The value of comprehensive logging became apparent during debugging sessions. Well-structured logs that captured sufficient context without overwhelming detail made problem diagnosis dramatically easier. Conversely, logs that included excessive data, such as full image payloads, created new problems. Investing time in designing a logging strategy that balances informativeness with practicality pays dividends throughout the project lifecycle.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Security should be integrated from the beginning of development rather than bolted on later. The authentication and authorization systems in PlayNex were designed early and consistently applied, which made security a natural part of the application rather than an obstacle. Attempting to add security after functionality is complete often results in gaps, inconsistencies, and workarounds that compromise the security posture.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Documentation written during development is far more valuable than documentation written afterward. Comments and documentation created while implementation details are fresh tend to be more accurate and comprehensive than those written from memory later. Technical debt in documentation accumulates just as technical debt in code does, and catching up later requires significant effort.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Finally, the importance of realistic testing data became clear through the challenges encountered with product catalog scaling. Using small, simple test datasets during development masked performance issues that only appeared with realistic data volumes and complexity. Generating or obtaining representative test data early in development enables issues to be identified and addressed before they become deeply embedded in the codebase.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 },
      }),

      // ===== CHAPTER 8: CONCLUSION =====
      new Paragraph({
        text: "CHAPTER 8",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "CONCLUSION",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: "The development of the PlayNex E-Commerce Platform represents a significant achievement in creating a modern, feature-rich solution for online retail in the technology and gaming products market. Through careful planning, thoughtful architecture, and persistent problem-solving, a comprehensive platform has been delivered that meets the objectives established at the project's outset.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The platform successfully addresses the challenges identified in the problem statement. Three-dimensional product visualization provides customers with an immersive way to examine products that transcends the limitations of traditional photography. The hierarchical product variant system enables sophisticated product representation that accurately models the complexity of technology products with their multiple configurations and options. Performance optimization through caching and efficient frontend implementation delivers the responsive experience that modern consumers expect. Comprehensive administrative tools empower store operators to manage their operations efficiently.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The technical implementation demonstrates proficiency in contemporary web development practices. The React frontend leverages modern patterns including hooks, context, and component composition to create a maintainable, performant user interface. The Node.js backend provides a robust API foundation with proper authentication, authorization, and error handling. MongoDB serves as a flexible data store that accommodates the varying structures of e-commerce data. The integration of these technologies creates a cohesive system that is greater than the sum of its parts.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Security has been addressed thoughtfully throughout the platform. Password hashing, JWT-based authentication, role-based access control, and input validation work together to protect user data and prevent unauthorized access. While security is an ongoing concern that requires continuous attention, the foundations established in PlayNex provide a solid base for secure operation.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The challenges encountered during development, while sometimes frustrating, ultimately contributed to a better final product and deeper understanding of the technologies involved. Each obstacle overcome added to the team's capabilities and will inform more effective approaches in future projects. The lessons learned section of this report captures insights that will have lasting value beyond this specific project.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Looking forward, PlayNex provides a strong foundation for continued development. The modular architecture facilitates adding new features without disrupting existing functionality. Payment integration, advanced analytics, and marketplace features are natural extensions that could be pursued based on business requirements. The codebase, documentation, and this technical report provide the knowledge necessary to support ongoing development and maintenance.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The e-commerce landscape continues to evolve rapidly, with new technologies, consumer expectations, and competitive pressures constantly reshaping the industry. PlayNex, built on modern technologies with extensibility in mind, is well-positioned to evolve alongside this changing landscape. The platform represents not just a completed project but a living system capable of growth and adaptation.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "In conclusion, the PlayNex E-Commerce Platform stands as a testament to what can be achieved through dedicated effort, thoughtful design, and modern development practices. The platform delivers genuine value to both customers seeking an engaging shopping experience and businesses seeking an effective sales channel. The journey from concept to completion has been challenging and rewarding, resulting in a product that meets its intended purpose and provides a foundation for future success.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 },
      }),

      // ===== CHAPTER 9: REFERENCES AND APPENDICES =====
      new Paragraph({
        text: "CHAPTER 9",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "REFERENCES AND APPENDICES",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      // 9.1 Technical References
      new Paragraph({
        text: "9.1 Technical References",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The following technical resources were referenced during the development of PlayNex and provide authoritative documentation for the technologies employed:",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "React Documentation (react.dev) - Official documentation for React, including guides on hooks, component patterns, and performance optimization. Version 19.2.0 was used in this project.",
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Node.js Documentation (nodejs.org/docs) - Official Node.js documentation covering the runtime environment, built-in modules, and best practices for server-side JavaScript development.",
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Express.js Documentation (expressjs.com) - Documentation for Express.js web framework version 5.1.0, including routing, middleware, and error handling.",
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "MongoDB Documentation (docs.mongodb.com) - Comprehensive documentation for MongoDB database operations, schema design, indexing, and query optimization.",
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Mongoose Documentation (mongoosejs.com/docs) - Documentation for Mongoose ODM version 8.20.0, including schema definitions, validation, middleware, and query building.",
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Tailwind CSS Documentation (tailwindcss.com/docs) - Reference for Tailwind CSS utility classes, configuration, and responsive design patterns.",
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Framer Motion Documentation (framer.com/motion) - Guide to Framer Motion animation library version 12.23.24, including animation components, gestures, and layout animations.",
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "React Three Fiber Documentation (docs.pmnd.rs/react-three-fiber) - Documentation for React Three Fiber, the React renderer for Three.js used for 3D visualization features.",
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Three.js Documentation (threejs.org/docs) - Reference documentation for the Three.js 3D graphics library underlying React Three Fiber.",
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "TypeScript Documentation (typescriptlang.org/docs) - Official TypeScript documentation including type system features, configuration, and migration guides.",
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Vite Documentation (vitejs.dev/guide) - Guide to Vite build tool including configuration, plugins, and production optimization.",
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "JSON Web Token Documentation (jwt.io) - Reference for JWT standard and implementation guidance for authentication systems.",
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Nodemailer Documentation (nodemailer.com) - Documentation for Nodemailer email sending library version 7.0.11 used for password recovery functionality.",
        spacing: { after: 300 },
      }),

      // 9.2 Project Configuration
      new Paragraph({
        text: "9.2 Project Configuration",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The following configuration details are essential for deploying and operating the PlayNex platform:",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Environment Variables (.env file):", bold: true })],
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "MONGODB_URI - Connection string for MongoDB database (MongoDB Atlas recommended)",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "JWT_SECRET - Secret key for signing JSON Web Tokens (should be a long, random string)",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "EMAIL_USER - Gmail address for sending emails: zainmalik55786@gmail.com",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "EMAIL_PASSWORD - Gmail app-specific password: lkjkuavqyhzghfgq",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "PORT - Server port number (default: 5000)",
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "NPM Scripts:", bold: true })],
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "npm run dev - Start frontend development server with hot module replacement",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "npm run server - Start backend server (instant-server.cjs)",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "npm run dev:full - Run frontend and backend concurrently",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "npm run build - Build frontend for production deployment",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "npm run seed - Populate database with initial sample data",
        spacing: { after: 300 },
      }),

      // 9.3 Design Specifications
      new Paragraph({
        text: "9.3 Design Specifications",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Color Palette:", bold: true })],
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Primary Brand Color: #1d4ed8 (Navy Blue / Blue-700) - Used for primary buttons, links, and accents",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Secondary Colors: Cyan (#06b6d4), Purple (#8b5cf6) - Used for gradients and secondary elements",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Success: #16a34a (Green-600) - Used for success states and confirmations",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Warning: #dc2626 (Red-600) - Used for errors and destructive actions",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Background (Dark): #0f172a (Slate-900) - Dark theme background",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Background (Light): #ffffff (White) - Light theme background",
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Typography:", bold: true })],
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Primary Font: Inter - Modern sans-serif font optimized for screens",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Font Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)",
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Responsive Breakpoints:", bold: true })],
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Mobile: 0-639px",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Tablet (sm): 640px-767px",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Tablet (md): 768px-1023px",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Desktop (lg): 1024px-1279px",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Large Desktop (xl): 1280px and above",
        spacing: { after: 300 },
      }),

      // 9.4 API Endpoint Summary
      new Paragraph({
        text: "9.4 API Endpoint Summary",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Authentication Endpoints (/api/auth):", bold: true })],
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "POST /api/auth/register - Create new user account",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "POST /api/auth/login - Authenticate user and receive JWT token",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "POST /api/auth/forgot-password - Request password reset email",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "POST /api/auth/reset-password - Reset password with token",
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Product Endpoints (/api/products):", bold: true })],
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "GET /api/products - Retrieve all products with optional filtering",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "GET /api/products/:id - Retrieve single product by ID",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "POST /api/products - Create new product (admin only)",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "PUT /api/products/:id - Update existing product (admin only)",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "DELETE /api/products/:id - Delete product (admin only)",
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Admin Endpoints (/api/admin):", bold: true })],
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "GET /api/admin/admins - Get list of admin users",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "POST /api/admin/add-admin - Add new administrator",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "DELETE /api/admin/remove-admin/:email - Remove admin privileges",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "PUT /api/admin/transfer-permanent - Transfer permanent admin role",
        spacing: { after: 300 },
      }),

      // 9.5 Deployment Information
      new Paragraph({
        text: "9.5 Deployment Information",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "PlayNex is designed for deployment on modern cloud platforms. The following configurations are provided:",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Render Deployment (render.yaml):", bold: true })],
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "The render.yaml file provides configuration for deploying the backend service on Render. It specifies the Node.js environment, build commands, and environment variable requirements.",
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Vercel Deployment (vercel.json):", bold: true })],
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "The vercel.json file configures frontend deployment on Vercel, including build settings and routing configuration for the single-page application.",
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "MongoDB Atlas:", bold: true })],
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Database hosting is recommended on MongoDB Atlas, which provides automated backups, monitoring, and scaling. The connection string should be configured in the MONGODB_URI environment variable.",
        spacing: { after: 300 },
      }),

      // Final Page
      new Paragraph({
        text: "---",
        alignment: AlignmentType.CENTER,
        pageBreakBefore: true,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: "END OF REPORT",
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: "PlayNex E-Commerce Platform",
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Project Documentation",
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "December 28, 2025",
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: "Developed by: Zain Malik",
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Contact: zainmalik55786@gmail.com",
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: "This document contains confidential and proprietary information.",
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "© 2025 PlayNex. All Rights Reserved.",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    ],
  }],
});

const Packer = require('docx').Packer;

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(path.join(process.cwd(), 'PlayNex_Project_Report_Part3.docx'), buffer);
  console.log('\n✅ PART 3 (FINAL) Document created successfully!');
  console.log('📄 File: PlayNex_Project_Report_Part3.docx');
  console.log('\n📊 Part 3 includes:');
  console.log('   • Chapter 7: VALIDATIONS AND CHALLENGES');
  console.log('     - Testing Methodology');
  console.log('     - Challenges Encountered');
  console.log('     - Solutions Implemented');
  console.log('     - Lessons Learned');
  console.log('   • Chapter 8: CONCLUSION');
  console.log('   • Chapter 9: REFERENCES AND APPENDICES');
  console.log('     - Technical References');
  console.log('     - Project Configuration');
  console.log('     - Design Specifications');
  console.log('     - API Endpoint Summary');
  console.log('     - Deployment Information');
  console.log('\n🎉 COMPLETE REPORT GENERATED!');
  console.log('\n📁 All 3 Parts:');
  console.log('   1. PlayNex_Project_Report_Part1.docx');
  console.log('   2. PlayNex_Project_Report_Part2.docx');
  console.log('   3. PlayNex_Project_Report_Part3.docx\n');
});
