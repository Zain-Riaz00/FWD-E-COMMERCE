const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } = require('docx');
const fs = require('fs');
const path = require('path');

const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // ===== TITLE PAGE =====
      new Paragraph({ text: "", spacing: { after: 1000 } }),
      new Paragraph({
        children: [new TextRun({ text: "PLAYNEX", bold: true, size: 72 })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [new TextRun({ text: "E-COMMERCE PLATFORM", bold: true, size: 48 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
      new Paragraph({
        text: "A Comprehensive Project Report",
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "on the Development and Implementation of a",
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Modern Full-Stack E-Commerce Web Application",
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      }),
      new Paragraph({ text: "", spacing: { after: 800 } }),
      new Paragraph({
        text: "Submitted By:",
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Zain Malik", bold: true, size: 28 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Email: zainmalik55786@gmail.com",
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
      new Paragraph({
        text: "Date of Submission: December 28, 2025",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),

      // ===== ACKNOWLEDGMENT =====
      new Paragraph({
        text: "ACKNOWLEDGMENT",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: "I would like to express my heartfelt gratitude to all those who have contributed to the successful completion of this project. The development of the PlayNex E-Commerce Platform has been a journey of learning, experimentation, and continuous improvement, and it would not have been possible without the support and guidance of many individuals and communities.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "First and foremost, I extend my sincere thanks to the open-source software community, whose dedication to creating and maintaining powerful libraries and frameworks has made modern web development accessible and efficient. The creators and contributors of React, Node.js, Express.js, MongoDB, and countless other technologies have laid the foundation upon which this project was built. Their commitment to open-source principles has democratized software development and enabled developers worldwide to build sophisticated applications.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "I am particularly grateful to the documentation teams behind these technologies. The comprehensive guides, tutorials, and API references provided by the React team at Meta, the Node.js Foundation, the MongoDB team, and the Framer Motion developers were invaluable resources throughout the development process. Clear and thorough documentation is often an unsung hero in software development, and these teams have set exemplary standards.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Special acknowledgment goes to the Stack Overflow community and various developer forums where countless questions were answered, bugs were debugged, and solutions were shared. The collaborative spirit of these communities embodies the best of what technology can achieve when knowledge is freely shared.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "I would also like to thank my family and friends for their patience, encouragement, and understanding during the intensive development phases of this project. Their support provided the motivation needed to overcome challenges and push through difficult debugging sessions.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Finally, I acknowledge the beta testers and early users who provided valuable feedback on the platform's usability, performance, and features. Their real-world insights helped shape PlayNex into a more robust and user-friendly application. This project stands as a testament to what can be achieved through dedication, community support, and a passion for creating meaningful software solutions.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 },
      }),

      // ===== TABLE OF CONTENTS =====
      new Paragraph({
        text: "TABLE OF CONTENTS",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({ text: "1. INTRODUCTION .................................................... 4", spacing: { after: 100 } }),
      new Paragraph({ text: "   1.1 Background of the Study", spacing: { after: 100 } }),
      new Paragraph({ text: "   1.2 Problem Statement", spacing: { after: 100 } }),
      new Paragraph({ text: "   1.3 Overview of the Solution", spacing: { after: 200 } }),
      new Paragraph({ text: "2. RATIONALE ........................................................ 7", spacing: { after: 100 } }),
      new Paragraph({ text: "   2.1 Need for Modern E-Commerce Solutions", spacing: { after: 100 } }),
      new Paragraph({ text: "   2.2 Technology Selection Justification", spacing: { after: 100 } }),
      new Paragraph({ text: "   2.3 Market Analysis and Target Audience", spacing: { after: 200 } }),
      new Paragraph({ text: "3. OBJECTIVES ...................................................... 10", spacing: { after: 100 } }),
      new Paragraph({ text: "   3.1 Primary Objectives", spacing: { after: 100 } }),
      new Paragraph({ text: "   3.2 Secondary Objectives", spacing: { after: 100 } }),
      new Paragraph({ text: "   3.3 Expected Outcomes", spacing: { after: 200 } }),
      new Paragraph({ text: "4. SCOPE ............................................................ 12", spacing: { after: 100 } }),
      new Paragraph({ text: "   4.1 Project Boundaries", spacing: { after: 100 } }),
      new Paragraph({ text: "   4.2 Included Features", spacing: { after: 100 } }),
      new Paragraph({ text: "   4.3 Limitations and Exclusions", spacing: { after: 200 } }),
      new Paragraph({ text: "5. SYSTEM ARCHITECTURE ............................................ 15", spacing: { after: 100 } }),
      new Paragraph({ text: "   5.1 Architectural Overview", spacing: { after: 100 } }),
      new Paragraph({ text: "   5.2 Frontend Architecture", spacing: { after: 100 } }),
      new Paragraph({ text: "   5.3 Backend Architecture", spacing: { after: 100 } }),
      new Paragraph({ text: "   5.4 Database Design", spacing: { after: 100 } }),
      new Paragraph({ text: "   5.5 Data Flow and Communication", spacing: { after: 200 } }),
      new Paragraph({ text: "6. TECHNICAL IMPLEMENTATION ....................................... 20", spacing: { after: 100 } }),
      new Paragraph({ text: "   6.1 Frontend Development", spacing: { after: 100 } }),
      new Paragraph({ text: "   6.2 Backend Development", spacing: { after: 100 } }),
      new Paragraph({ text: "   6.3 Database Implementation", spacing: { after: 100 } }),
      new Paragraph({ text: "   6.4 Security Implementation", spacing: { after: 100 } }),
      new Paragraph({ text: "   6.5 Key Features Implementation", spacing: { after: 200 } }),
      new Paragraph({ text: "7. VALIDATIONS AND CHALLENGES ..................................... 28", spacing: { after: 100 } }),
      new Paragraph({ text: "   7.1 Testing Methodology", spacing: { after: 100 } }),
      new Paragraph({ text: "   7.2 Challenges Encountered", spacing: { after: 100 } }),
      new Paragraph({ text: "   7.3 Solutions Implemented", spacing: { after: 100 } }),
      new Paragraph({ text: "   7.4 Lessons Learned", spacing: { after: 200 } }),
      new Paragraph({ text: "8. CONCLUSION ...................................................... 32", spacing: { after: 200 } }),
      new Paragraph({ text: "9. REFERENCES AND APPENDICES ...................................... 34", spacing: { after: 200 } }),

      // ===== CHAPTER 1: INTRODUCTION =====
      new Paragraph({
        text: "CHAPTER 1",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "INTRODUCTION",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      // 1.1 Background
      new Paragraph({
        text: "1.1 Background of the Study",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The landscape of retail commerce has undergone a profound transformation over the past two decades, driven primarily by the rapid advancement of internet technologies and the widespread adoption of digital devices. Electronic commerce, commonly known as e-commerce, has emerged as a dominant force in the global economy, fundamentally altering how businesses operate and consumers shop. According to industry analysts, global e-commerce sales have been growing at an unprecedented rate, with projections indicating continued expansion as more consumers embrace online shopping as their preferred method of purchasing goods and services.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The evolution of e-commerce can be traced through several distinct phases. The first phase, beginning in the mid-1990s, saw the emergence of basic online catalogs and simple transaction systems. Companies like Amazon and eBay pioneered this space, demonstrating the viability of selling products directly to consumers over the internet. The second phase brought improvements in user experience, with enhanced navigation, better search functionality, and the introduction of customer reviews. The third and current phase is characterized by immersive experiences, personalization, mobile-first design, and the integration of advanced technologies such as artificial intelligence, augmented reality, and three-dimensional visualization.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Within this evolving landscape, the technology and gaming peripherals market represents a particularly dynamic segment. This market encompasses a wide range of products including computer components, gaming accessories, audio equipment, smart devices, and related technology products. Consumers in this segment tend to be tech-savvy, detail-oriented, and demanding in their expectations of online shopping experiences. They require detailed product specifications, high-quality imagery, and increasingly, the ability to visualize products in three-dimensional space before making purchase decisions.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The COVID-19 pandemic, which began in 2020, served as a catalyst for e-commerce adoption across all demographics and product categories. Physical retail restrictions and health concerns drove millions of consumers to online shopping, many for the first time. This massive shift in consumer behavior has had lasting effects, with many shoppers continuing to prefer online purchasing even as physical retail has resumed. The pandemic also highlighted the importance of robust, reliable, and user-friendly e-commerce platforms capable of handling increased traffic and meeting elevated consumer expectations.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Against this backdrop, the development of PlayNex was conceived as a response to the need for modern, feature-rich e-commerce platforms specifically designed for the technology and gaming products market. The project recognizes that success in contemporary e-commerce requires more than basic catalog and checkout functionality. Modern platforms must deliver experiences that engage users, build trust, and facilitate informed purchasing decisions while maintaining technical excellence in performance, security, and reliability.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 1.2 Problem Statement
      new Paragraph({
        text: "1.2 Problem Statement",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "Despite the proliferation of e-commerce platforms, several significant challenges persist in the online retail space, particularly within the technology and gaming products sector. These challenges create friction in the customer journey, reduce conversion rates, and ultimately impact business success. Understanding these problems is essential to appreciating the value proposition of PlayNex and the design decisions that shaped its development.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The first major challenge is the limitation of two-dimensional product representation. Traditional e-commerce platforms rely on static images to showcase products, which, regardless of their quality, cannot fully convey the physical characteristics of items. This limitation is particularly acute for technology products where form factor, port placement, lighting effects, and aesthetic design are important purchasing considerations. Consumers cannot rotate products, examine them from different angles, or appreciate their three-dimensional presence through conventional product photographs. This gap between online and physical shopping experiences contributes to customer uncertainty and hesitation in making purchase decisions.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The second challenge relates to product variant management complexity. Technology products frequently come in multiple configurations, including different colors, sizes, storage capacities, and regional variations. Many existing platforms struggle to present these variants in an intuitive manner, often requiring customers to navigate through multiple pages or dropdown menus to understand available options. This complexity can lead to customer confusion, abandoned shopping carts, and increased customer service inquiries. A more sophisticated approach to variant presentation and management is needed to address these issues.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The third challenge involves performance and user experience. Many e-commerce platforms, particularly those built on legacy architectures or using outdated technologies, suffer from slow loading times, unresponsive interfaces, and jarring page transitions. Modern consumers, accustomed to the smooth experiences provided by social media and streaming platforms, have little patience for sluggish e-commerce sites. Studies have shown that even one-second delays in page loading can significantly impact conversion rates and customer satisfaction. The need for fast, responsive, and visually appealing interfaces has never been greater.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The fourth challenge concerns security and trust. E-commerce transactions involve sensitive personal and financial information, making security a paramount concern. Unfortunately, many platforms fail to implement robust security measures, or when they do, fail to communicate their security practices to customers effectively. This creates anxiety among consumers who may hesitate to share their information or complete transactions. Building and maintaining trust requires not only implementing strong security measures but also creating an interface that conveys professionalism and reliability.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The fifth challenge is administrative complexity. Store operators require efficient tools to manage products, process orders, handle customer inquiries, and analyze business performance. Many platforms offer either overly simplistic administrative interfaces that lack necessary functionality or overly complex systems that require extensive training to use effectively. Finding the balance between power and usability in administrative tools remains an ongoing challenge in e-commerce platform development.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 1.3 Overview of the Solution
      new Paragraph({
        text: "1.3 Overview of the Solution",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "PlayNex addresses the challenges outlined above through a comprehensive, modern approach to e-commerce platform development. The solution combines cutting-edge frontend technologies with a robust backend infrastructure to deliver an experience that meets the expectations of both customers and store administrators.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "At its core, PlayNex is built upon a technology stack carefully selected to balance performance, developer productivity, and long-term maintainability. The frontend utilizes React version 19.2.0, the latest iteration of Facebook's popular user interface library, combined with TypeScript for enhanced code quality through static typing. The application is bundled using Vite, a next-generation build tool that provides near-instantaneous hot module replacement during development and optimized production builds. Styling is implemented using Tailwind CSS, a utility-first framework that enables rapid UI development while maintaining consistency across the application.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The platform's distinguishing feature is its integration of three-dimensional product visualization capabilities. Utilizing React Three Fiber, a React renderer for Three.js, PlayNex enables customers to interact with 3D product models directly within the browser. Customers can rotate products, zoom in on details, and examine items from any angle, replicating aspects of the physical shopping experience that have traditionally been impossible online. This feature is particularly valuable for technology products where design and form factor are significant purchasing considerations.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Animation and visual polish are achieved through the integration of Framer Motion and GSAP (GreenSock Animation Platform). These libraries power smooth page transitions, interactive element animations, and micro-interactions that contribute to a premium user experience. Special attention has been paid to performance optimization, with animations carefully crafted to maintain 60 frames per second even on mid-range devices. The interface supports both dark and light themes, with a sophisticated navy blue color scheme (#1d4ed8) serving as the primary brand color.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The backend infrastructure is powered by Node.js with Express.js version 5.1.0 providing the web framework. This combination offers excellent performance for handling concurrent requests while maintaining the flexibility needed for rapid feature development. The backend implements a RESTful API architecture, providing clear and predictable endpoints for all data operations. An innovative caching system stores frequently accessed product data in memory, dramatically reducing response times for common queries while maintaining synchronization with the persistent database.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Data persistence is handled by MongoDB, a document-oriented NoSQL database that provides flexibility in schema design and excellent scalability characteristics. MongoDB Atlas, the cloud-hosted version of MongoDB, is used for production deployments, offering automated backups, monitoring, and easy scaling as the platform grows. The Mongoose ODM (Object Document Mapper) provides schema validation, middleware hooks, and query building capabilities that simplify database operations throughout the application.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Security is implemented at multiple layers throughout the platform. User authentication utilizes JSON Web Tokens (JWT), providing stateless session management that scales effectively across distributed deployments. Passwords are hashed using bcryptjs before storage, ensuring that even in the event of a database breach, user credentials remain protected. Role-based access control distinguishes between regular users, administrators, and permanent administrators, with each role granted appropriate permissions. The platform also supports password recovery through email, utilizing Gmail SMTP with app-specific passwords for secure mail delivery.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "For administrators, PlayNex provides a comprehensive management interface enabling efficient product catalog management, including support for hierarchical product structures with parent products, child variants (such as different models), and grandchild variants (such as color options). Additional administrative features include category management, user administration, admin role management, and content management for static pages. The administrative interface maintains the same visual polish and responsiveness as the customer-facing portions of the platform, ensuring a pleasant experience for store operators.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 },
      }),

      // ===== CHAPTER 2: RATIONALE =====
      new Paragraph({
        text: "CHAPTER 2",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "RATIONALE",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      // 2.1 Need for Modern E-Commerce Solutions
      new Paragraph({
        text: "2.1 Need for Modern E-Commerce Solutions",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The decision to develop PlayNex was not made in isolation but rather emerged from a careful analysis of current market conditions, technological trends, and the evolving expectations of both consumers and businesses. Understanding the rationale behind this project requires examining the broader context of e-commerce in the contemporary digital landscape.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The e-commerce industry has reached a level of maturity where baseline functionality is no longer sufficient for differentiation. Virtually all e-commerce platforms can process transactions, display product catalogs, and manage customer accounts. These capabilities have become table stakes, expected by customers as a minimum standard. Competitive advantage now derives from the quality of the user experience, the sophistication of features, and the ability to create emotional connections with customers through design and interaction.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Consumer expectations have been shaped by exposure to best-in-class digital experiences across various domains. Users of Netflix expect content to load instantly and play without buffering. Users of Instagram expect smooth, gesture-driven interfaces that respond immediately to input. Users of Amazon expect personalized recommendations, one-click purchasing, and comprehensive product information. When these same users visit e-commerce sites that fail to meet these standards, they perceive the sites as outdated, unprofessional, or untrustworthy. The bar for acceptable user experience has been raised across the board.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The technology products market presents unique requirements that many general-purpose e-commerce platforms fail to address adequately. Tech-savvy consumers demand detailed specifications presented in accessible formats. They want to compare products side by side, examine features in detail, and understand the implications of different configurations. Gaming peripherals customers, in particular, have aesthetic preferences that are difficult to evaluate through traditional product photography. RGB lighting effects, material textures, and ergonomic design all benefit from more immersive presentation methods.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Furthermore, the proliferation of mobile devices has fundamentally changed how people shop online. Responsive design, once considered a nice-to-have feature, is now absolutely essential. A significant and growing portion of e-commerce traffic originates from smartphones and tablets, devices with smaller screens, touch-based interaction, and often slower network connections. E-commerce platforms must deliver excellent experiences across this diverse range of devices and conditions to capture the full breadth of potential customers.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 2.2 Technology Selection Justification
      new Paragraph({
        text: "2.2 Technology Selection Justification",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The technology choices underlying PlayNex were made through careful evaluation of available options, considering factors including performance, developer experience, community support, long-term viability, and alignment with project requirements. Each major technology decision warrants explanation and justification.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "React was selected as the frontend framework for several compelling reasons. First, React's component-based architecture promotes code reusability and maintainability, allowing the development of a library of UI components that can be combined and reused throughout the application. Second, React's virtual DOM implementation provides efficient updates to the user interface, minimizing costly DOM manipulations and contributing to smooth performance. Third, React's extensive ecosystem offers solutions for nearly every development challenge, from state management to routing to animation. Finally, React's widespread adoption ensures a large pool of developers familiar with the technology, facilitating future maintenance and enhancement of the platform.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "TypeScript was adopted rather than plain JavaScript to enhance code quality and developer productivity. TypeScript's static type system catches errors at compile time that would otherwise only surface during runtime, reducing bugs and improving reliability. The enhanced IDE support enabled by TypeScript, including intelligent code completion and refactoring tools, accelerates development and reduces cognitive load. While TypeScript introduces additional complexity in the build process, the benefits in code quality and maintainability far outweigh this overhead, particularly for a project of this scale.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Vite was chosen as the build tool over alternatives such as Create React App or webpack-based configurations. Vite's use of native ES modules during development provides near-instantaneous server startup and hot module replacement, dramatically improving the development experience compared to traditional bundlers. For production builds, Vite leverages Rollup to produce optimized, tree-shaken bundles with efficient code splitting. The performance improvements provided by Vite translate directly into faster iteration cycles during development and better load times for end users.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Tailwind CSS was selected for styling due to its utility-first approach that enables rapid UI development. Rather than writing custom CSS for each component, Tailwind provides a comprehensive set of utility classes that can be composed to create virtually any design. This approach reduces the CSS bundle size through purging of unused classes, eliminates the need to invent class names, and maintains design consistency through a predefined design system. While Tailwind has a learning curve, it ultimately accelerates development and produces more maintainable stylesheets.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Node.js with Express.js was chosen for the backend due to the advantages of JavaScript isomorphism—using the same language on both frontend and backend reduces context switching and enables code sharing where appropriate. Express.js provides a minimal, flexible framework that imposes few constraints on application structure while providing the essential functionality needed for web application development. The Node.js ecosystem offers excellent packages for virtually every backend requirement, from authentication to database connectivity to email sending.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "MongoDB was selected as the database for its flexibility and scalability. Unlike relational databases, MongoDB's document model allows for nested data structures that map naturally to JavaScript objects, simplifying data handling throughout the application. This flexibility is particularly valuable in e-commerce where product schemas can vary significantly—a laptop has different attributes than a mouse, yet both must coexist in the product catalog. MongoDB Atlas provides a managed database service with automated backups, monitoring, and easy scaling, reducing operational overhead.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 2.3 Market Analysis and Target Audience
      new Paragraph({
        text: "2.3 Market Analysis and Target Audience",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "Understanding the target market is essential for developing an e-commerce platform that meets real needs and delivers genuine value. PlayNex is positioned to serve the technology and gaming peripherals market, a segment characterized by engaged, knowledgeable consumers with specific expectations and preferences.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The primary target audience consists of technology enthusiasts and gamers who purchase equipment for both recreational and professional use. This demographic skews younger, with a concentration in the 18-45 age range, though technology products appeal across age groups. These consumers are typically comfortable with technology, accustomed to online shopping, and discerning in their evaluation of products and platforms. They research products thoroughly before purchasing, consulting reviews, specifications, and comparison resources.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "A secondary target audience includes content creators—YouTubers, streamers, podcasters, and social media influencers—who require quality equipment for their work. This group often has specific technical requirements and appreciates detailed product information that helps them make informed decisions. They may also have audiences who look to them for product recommendations, amplifying the impact of providing an excellent shopping experience.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "From a business perspective, PlayNex targets small to medium-sized technology retailers who seek a modern, customizable platform without the expense and complexity of enterprise solutions. These businesses need the ability to manage products efficiently, present their offerings professionally, and compete with larger retailers on user experience if not on scale. The administrative features of PlayNex are designed with these operators in mind, providing powerful capabilities through intuitive interfaces.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Market analysis indicates strong growth potential in the gaming peripherals segment specifically. The global gaming peripherals market has experienced consistent growth, driven by the expansion of esports, the popularity of streaming, and the general trend toward gaming as a mainstream entertainment activity. Within this market, premium products command significant margins, and customers are willing to pay for quality. An e-commerce platform that can effectively present these products and build customer confidence stands to capture meaningful market share.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 },
      }),

      // ===== CHAPTER 3: OBJECTIVES =====
      new Paragraph({
        text: "CHAPTER 3",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "OBJECTIVES",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      // 3.1 Primary Objectives
      new Paragraph({
        text: "3.1 Primary Objectives",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The primary objectives of the PlayNex project define the core goals that must be achieved for the project to be considered successful. These objectives were established at the outset of development and have guided decision-making throughout the project lifecycle.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The first primary objective is to develop a fully functional e-commerce platform capable of supporting the complete customer journey from product discovery through purchase completion. This encompasses product catalog browsing, search and filtering capabilities, detailed product pages, shopping cart management, user account creation and authentication, and order placement. The platform must handle these core e-commerce functions reliably and efficiently, providing a foundation upon which enhanced features can be built.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The second primary objective is to implement three-dimensional product visualization that enables customers to interact with product models in ways not possible with traditional photography. This feature must be integrated seamlessly into the product viewing experience, loading quickly and responding smoothly to user input. The 3D visualization should enhance rather than complicate the shopping experience, providing value to customers who choose to engage with it while not impeding those who prefer traditional product presentation.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The third primary objective is to create an administrative interface that enables efficient management of all aspects of the e-commerce operation. Store administrators must be able to add, edit, and remove products; manage categories and product variants; handle user accounts and permissions; and configure site content. The administrative interface should be powerful yet accessible, enabling operators to perform complex tasks without extensive training or technical expertise.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The fourth primary objective is to implement robust security measures that protect user data and build customer trust. This includes secure authentication mechanisms, encrypted password storage, protection against common web vulnerabilities, and secure handling of sensitive information. Security cannot be an afterthought but must be woven into the platform's architecture from the foundation upward.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 3.2 Secondary Objectives
      new Paragraph({
        text: "3.2 Secondary Objectives",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "Beyond the primary objectives, several secondary objectives contribute to the overall quality and success of the platform. While these objectives are important, they are distinguished from primary objectives by their supporting rather than essential nature.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "A key secondary objective is to achieve excellent performance across all aspects of the platform. This includes fast initial page loads, responsive interaction, smooth animations, and efficient data retrieval. Performance optimization should target modern devices while maintaining acceptable performance on older hardware. The target is to maintain 60 frames per second for animations and sub-second response times for common operations.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Another secondary objective is to implement a comprehensive review and rating system that enables customers to share their experiences and opinions. User-generated reviews build trust and provide valuable information to prospective buyers. The review system should support star ratings, written comments, and verification of reviewer authenticity where possible.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Supporting both dark and light themes constitutes another secondary objective. Theme support not only caters to user preferences but also demonstrates attention to detail and user experience. The theme implementation should be consistent across all components and persist across sessions.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Finally, implementing a notification system represents a secondary objective that enhances user engagement. Notifications keep users informed about order status, promotional activities, and system updates. The notification system should be unobtrusive yet effective, providing value without becoming annoying.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 3.3 Expected Outcomes
      new Paragraph({
        text: "3.3 Expected Outcomes",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The successful completion of PlayNex is expected to yield several tangible outcomes that validate the project's success and provide value to stakeholders.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The primary expected outcome is a production-ready e-commerce platform that can be deployed to serve real customers. This platform should be capable of handling typical e-commerce traffic, processing transactions reliably, and providing a positive user experience that encourages repeat business and customer loyalty.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "A second expected outcome is a codebase that demonstrates best practices in modern web development. The project should serve as a reference implementation showcasing how to build a complex application using contemporary technologies and architectural patterns. Code quality, organization, and documentation should meet professional standards.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "A third expected outcome is the development of reusable components and patterns that can be applied to future projects. The component library, API design, and architectural decisions made during PlayNex development should provide templates and inspiration for subsequent development efforts.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Finally, the project is expected to result in enhanced skills and knowledge for all involved in its development. The process of building a full-stack e-commerce platform provides exposure to a wide range of technologies, challenges, and solutions that contribute to professional growth and expertise.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 },
      }),

      // PART 1 END MARKER
      new Paragraph({
        text: "--- END OF PART 1 ---",
        alignment: AlignmentType.CENTER,
        pageBreakBefore: true,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: "This document continues with Chapter 4: SCOPE, Chapter 5: SYSTEM ARCHITECTURE, Chapter 6: TECHNICAL IMPLEMENTATION, Chapter 7: VALIDATIONS AND CHALLENGES, Chapter 8: CONCLUSION, and Chapter 9: REFERENCES AND APPENDICES.",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Please request Part 2 to continue generating the remaining chapters.",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    ],
  }],
});

const Packer = require('docx').Packer;

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(path.join(process.cwd(), 'PlayNex_Project_Report_Part1.docx'), buffer);
  console.log('\n✅ PART 1 Document created successfully!');
  console.log('📄 File: PlayNex_Project_Report_Part1.docx');
  console.log('\n📊 Part 1 includes:');
  console.log('   • Title Page');
  console.log('   • Acknowledgment (detailed)');
  console.log('   • Table of Contents');
  console.log('   • Chapter 1: Introduction');
  console.log('     - Background of the Study');
  console.log('     - Problem Statement');
  console.log('     - Overview of the Solution');
  console.log('   • Chapter 2: Rationale');
  console.log('     - Need for Modern E-Commerce Solutions');
  console.log('     - Technology Selection Justification');
  console.log('     - Market Analysis and Target Audience');
  console.log('   • Chapter 3: Objectives');
  console.log('     - Primary Objectives');
  console.log('     - Secondary Objectives');
  console.log('     - Expected Outcomes');
  console.log('\n📝 Request "continue" or "part 2" for remaining chapters!\n');
});
