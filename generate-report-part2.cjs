const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // ===== CHAPTER 4: SCOPE =====
      new Paragraph({
        text: "CHAPTER 4",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "SCOPE",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      // 4.1 Project Boundaries
      new Paragraph({
        text: "4.1 Project Boundaries",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "Defining clear project boundaries is essential for managing expectations, allocating resources effectively, and ensuring successful project completion. The scope of PlayNex was carefully delineated to create a platform that is comprehensive enough to serve real-world needs while remaining achievable within available time and resource constraints. Understanding what falls within and outside the project scope provides clarity for both developers and stakeholders.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The geographical scope of PlayNex is initially focused on serving customers within a single region, with the platform designed to support a single currency and language. While the architecture does not preclude future internationalization, implementing multi-currency support, language localization, and region-specific compliance requirements falls outside the current scope. This focused approach allows for deeper optimization of the core experience rather than spreading efforts across multiple locales.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The temporal scope of the project encompasses the initial development phase, from conception through the launch of a production-ready platform. Post-launch activities such as ongoing maintenance, feature enhancements, and scaling operations are acknowledged as necessary but fall outside the scope of this initial project phase. The platform is designed with extensibility in mind, facilitating future development efforts, but defining and implementing future features is not part of the current scope.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The functional scope centers on core e-commerce capabilities essential for operating an online technology products store. This includes product catalog management, user account management, shopping cart functionality, and administrative tools. The platform provides the foundation for complete e-commerce operations while acknowledging that some advanced features may be added in subsequent development phases.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 4.2 Included Features
      new Paragraph({
        text: "4.2 Included Features",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The features included within the scope of PlayNex represent a comprehensive set of capabilities designed to support both customer-facing operations and administrative functions. Each feature was evaluated for its contribution to the overall platform value and its feasibility within project constraints.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "User authentication and account management form the foundation of personalized e-commerce experiences. The platform includes complete user registration with email and password, secure login functionality with session management using JWT tokens, password recovery through email verification, and user profile management. Users can view their account information, update personal details, and manage their preferences. The authentication system supports role-based access control with three distinct roles: regular users, administrators, and permanent administrators, each with appropriately scoped permissions.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Product catalog features enable comprehensive product presentation and discovery. The platform supports hierarchical product structures with parent products, child variants representing different models or configurations, and grandchild variants representing options such as colors. Each product can have multiple images, detailed descriptions, specifications, pricing information, and stock levels. Products are organized into categories, and customers can browse by category, search by keywords, and filter results by various attributes including price range and customer ratings.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Three-dimensional product visualization represents a distinguishing feature of the platform. Using React Three Fiber and Three.js, the platform renders interactive 3D product models that customers can rotate, zoom, and examine from any angle. This immersive product presentation provides customers with a richer understanding of products than traditional photography alone can offer. The 3D viewing experience is integrated seamlessly into product detail pages, loading efficiently and responding smoothly to user interactions.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Shopping cart functionality enables customers to collect products for purchase. The cart supports adding products with specific variants, adjusting quantities, removing items, and calculating totals. Cart contents persist across browser sessions, ensuring that customers do not lose their selections. The cart interface displays product images, names, selected variants, individual prices, and running totals, providing complete transparency into the pending purchase.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The review and rating system enables customers to share their experiences with products. Customers can submit ratings on a five-star scale along with written reviews describing their experiences. Reviews are displayed on product pages, providing social proof and valuable information for prospective buyers. The system calculates and displays average ratings, and reviews can be sorted by recency or rating. Review management capabilities allow users to edit or delete their own reviews.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Administrative features provide store operators with comprehensive management capabilities. The admin panel enables product management including creating, editing, and deleting products and variants. Category management allows organizing products into logical groupings. User administration provides visibility into registered users and the ability to manage admin privileges. Content management features enable editing of static page content including the about page and contact information. The admin interface maintains the same visual quality and responsiveness as customer-facing pages.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Notification functionality keeps users informed about relevant activities. The notification system delivers alerts for various events and can be extended to support additional notification types. Users can view their notifications through a dedicated interface and mark notifications as read. The notification bell icon displays a count of unread notifications, providing at-a-glance awareness of pending items.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Theme support allows users to choose between dark and light visual modes. The dark theme features a sophisticated navy blue color scheme centered on the primary brand color of #1d4ed8, while the light theme provides a bright, clean aesthetic suitable for daytime use or user preference. Theme selection persists across sessions, and the transition between themes is animated smoothly.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 4.3 Limitations and Exclusions
      new Paragraph({
        text: "4.3 Limitations and Exclusions",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "While PlayNex provides comprehensive e-commerce functionality, certain features and capabilities fall outside the current project scope. Understanding these limitations is important for setting appropriate expectations and planning future development efforts.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Payment processing integration is not included in the current scope. While the platform supports shopping cart functionality and order placement, actual payment processing through services such as Stripe, PayPal, or other payment gateways is planned for future implementation. The current system allows orders to be placed for manual processing, suitable for development, testing, and businesses that handle payments through alternative channels.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Order fulfillment and shipping integration are excluded from the current scope. Features such as shipping rate calculation, carrier integration, tracking number management, and shipping label generation are not implemented. The platform records order information but does not automate fulfillment workflows. These capabilities are commonly handled through separate fulfillment systems and could be integrated in future development phases.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Advanced analytics and reporting capabilities are limited in the current implementation. While basic data is collected through normal operations, comprehensive dashboards showing sales trends, customer behavior analysis, inventory forecasting, and business intelligence features are not included. Such features require significant development effort and are best addressed after core functionality is established and real usage data becomes available.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Customer support features such as live chat, ticketing systems, and help desk integration fall outside the current scope. The platform includes static help and FAQ pages but does not provide interactive support channels. Businesses using PlayNex would need to implement customer support through separate systems or manual processes.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Marketing automation features including email campaigns, abandoned cart recovery, promotional code management beyond basic discount codes, and customer segmentation are not implemented. These features, while valuable for mature e-commerce operations, represent a substantial development effort that is deferred to future phases.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Multi-vendor marketplace functionality is excluded. PlayNex is designed as a single-vendor e-commerce platform rather than a marketplace where multiple sellers can list products. Supporting multiple vendors would require significant additional functionality including vendor onboarding, commission management, payout processing, and seller dashboards.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Mobile application development is not included in the current scope. While the web platform is fully responsive and provides an excellent experience on mobile devices, native iOS and Android applications are not developed. The responsive web design serves mobile users effectively, and native applications could be considered for future development if usage patterns warrant the investment.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 },
      }),

      // ===== CHAPTER 5: SYSTEM ARCHITECTURE =====
      new Paragraph({
        text: "CHAPTER 5",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "SYSTEM ARCHITECTURE",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      // 5.1 Architectural Overview
      new Paragraph({
        text: "5.1 Architectural Overview",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The architecture of PlayNex follows a modern three-tier design pattern, separating concerns into distinct layers that can be developed, tested, and scaled independently. This architectural approach has become the industry standard for web applications due to its flexibility, maintainability, and scalability characteristics. Understanding the overall architecture provides context for the detailed implementation discussions that follow.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The presentation tier, also known as the frontend or client layer, handles all user interface rendering and direct user interaction. This layer is responsible for presenting information to users in an engaging and intuitive manner, capturing user input, validating form data on the client side, and communicating with the backend through API requests. In PlayNex, the presentation tier is implemented as a Single Page Application (SPA) using React, meaning that the initial page load delivers a JavaScript application that subsequently handles navigation and updates without requiring full page reloads.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The application tier, also known as the backend or business logic layer, handles data processing, business rule enforcement, authentication, authorization, and coordination between the presentation and data tiers. This layer receives requests from the frontend, validates and processes them, interacts with the database as needed, and returns appropriate responses. In PlayNex, the application tier is implemented using Node.js with Express.js, exposing a RESTful API that the frontend consumes.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The data tier is responsible for persistent storage and retrieval of application data. This layer manages the database, handles queries, ensures data integrity, and provides mechanisms for data backup and recovery. In PlayNex, the data tier utilizes MongoDB, a document-oriented NoSQL database, accessed through the Mongoose ODM which provides schema validation, middleware capabilities, and a clean query interface.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Communication between tiers follows established patterns. The frontend communicates with the backend exclusively through HTTP requests to RESTful API endpoints. JSON serves as the data interchange format for all API communications, providing a lightweight, human-readable format that is native to JavaScript environments. The backend communicates with the database through the Mongoose driver, which manages connection pooling, query execution, and result transformation.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "An important architectural enhancement in PlayNex is the implementation of an in-memory caching layer within the application tier. Frequently accessed data, particularly product information that changes infrequently but is requested frequently, is cached in server memory. This caching dramatically reduces database load and response times for common operations. The cache is synchronized with the database whenever changes occur, ensuring data consistency while maintaining performance benefits.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 5.2 Frontend Architecture
      new Paragraph({
        text: "5.2 Frontend Architecture",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The frontend architecture of PlayNex is built upon React's component-based paradigm, which promotes modularity, reusability, and maintainability. Components are the fundamental building blocks of the user interface, each encapsulating its own structure, styling, and behavior. This approach enables complex interfaces to be constructed from simpler, well-tested components.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The component hierarchy follows a logical organization based on function and scope. At the highest level, page components correspond to routes in the application and represent complete screens such as the home page, product listing page, product detail page, cart page, and authentication page. These page components orchestrate the display of multiple smaller components and manage page-level state and data fetching.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Below page components, layout components provide structural elements that are shared across multiple pages. The navigation bar component, for instance, appears on every page and provides consistent navigation, search functionality, cart access, and user account controls. Similarly, footer components provide consistent bottom-of-page content across the site. These layout components are typically rendered by a root layout component that wraps all page content.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Feature components implement specific functionality such as product cards, product filters, shopping cart items, review displays, and administrative modals. These components are designed to be reusable where appropriate and self-contained in their functionality. A product card component, for example, can display any product passed to it as props, making it reusable across product listings, search results, and recommendation sections.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "UI components form the lowest level of the component hierarchy, providing basic interface elements such as buttons, inputs, modals, tooltips, and loading indicators. These components are highly reusable and styled consistently with the application's design system. By building up from these foundational components, visual consistency is maintained throughout the application.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "State management in PlayNex utilizes React's built-in capabilities supplemented by Context API for global state. Local component state, managed through the useState hook, handles UI state that is contained within individual components. Global state that must be accessible across component boundaries, such as authentication status, shopping cart contents, and theme preferences, is managed through Context providers that wrap the application.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The AdminContext manages authentication state for administrative users, tracking whether an admin is logged in and their permission level. The CartContext manages shopping cart state including items, quantities, and calculated totals. The ThemeContext manages the current theme preference and provides toggle functionality. These contexts make relevant state and functions available throughout the component tree without requiring manual prop passing through intermediate components.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Routing is handled by React Router, which maps URL paths to page components and manages navigation history. The routing configuration defines both public routes accessible to all users and protected routes requiring authentication. Navigation between routes triggers smooth animations powered by Framer Motion, providing visual continuity and a polished user experience.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 5.3 Backend Architecture
      new Paragraph({
        text: "5.3 Backend Architecture",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The backend architecture follows a modular design organized around RESTful principles, with clear separation between routing, business logic, and data access concerns. This organization facilitates maintenance, testing, and future enhancement of the system.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "At the entry point, the Express application is configured with necessary middleware including CORS for cross-origin request handling, JSON body parsing for request processing, and any authentication middleware for protected routes. Environment variables are loaded using dotenv to configure sensitive values such as database connection strings, JWT secrets, and email credentials without hardcoding them in the source code.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The routing layer defines API endpoints organized by resource type. Product routes handle all operations related to products including listing, retrieval, creation, update, and deletion. Authentication routes manage user registration, login, and password recovery. User routes handle profile operations. Review routes manage product reviews. Admin routes provide administrative functions. Category routes handle product categorization. Notification routes manage the notification system. Each route module focuses on a specific resource, keeping code organized and maintainable.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Route handlers receive incoming requests, extract relevant data from request parameters, query strings, and bodies, perform necessary validation, invoke appropriate business logic, and format responses. Error handling is implemented consistently across routes, with appropriate HTTP status codes and error messages returned for various failure conditions.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The data access layer utilizes Mongoose models that define the structure and behavior of documents in MongoDB collections. Each model specifies field types, validation rules, default values, and any indexes needed for query performance. Mongoose middleware hooks enable automatic processing during save, update, or removal operations, useful for tasks such as timestamp management or cascading updates.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The caching system represents a significant performance optimization in the PlayNex backend. Product data, which is frequently read but infrequently modified, is cached in server memory upon initial retrieval from the database. Subsequent requests for product data are served directly from the cache, eliminating database query overhead and reducing response times dramatically. When products are modified through administrative operations, the cache is updated synchronously to maintain consistency.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Database connection management is handled carefully to ensure reliability. The connection to MongoDB Atlas is established at server startup, with automatic reconnection logic handling any connection interruptions. A periodic health check pings the database to verify connection status and logs any issues. This proactive monitoring helps identify and address connectivity problems before they impact users.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 5.4 Database Design
      new Paragraph({
        text: "5.4 Database Design",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The database design for PlayNex leverages MongoDB's document model to create a flexible, efficient data structure that supports the platform's e-commerce functionality. Unlike relational databases that normalize data across multiple tables with foreign key relationships, MongoDB allows related data to be embedded within documents or referenced across collections as appropriate for each use case.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The User collection stores user account information including authentication credentials and profile data. Each user document contains fields for name, email address, hashed password, administrative flags indicating whether the user is an admin or permanent admin, verification status, avatar URL, phone number, and address information. The email field is indexed for fast lookup during authentication and is enforced as unique to prevent duplicate accounts. Passwords are never stored in plain text but are hashed using bcryptjs before storage.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The Product collection stores product information with support for hierarchical relationships between parent products, child variants, and grandchild variants. Each product document includes name, description, price, category, images array, stock quantity, rating, and specifications. The productType field indicates whether a product is a parent, child, or grandchild in the hierarchy, and the parentId field references the parent product for variants. This design enables flexible product structures where, for example, a gaming headset parent product can have wireless and wired child variants, each with multiple color grandchild variants.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The Review collection stores customer reviews with references to both the user who wrote the review and the product being reviewed. Each review document contains the rating value between one and five, the written comment text, and timestamps for creation and modification. Reviews are associated with products through reference rather than embedding, allowing reviews to be queried and displayed independently while maintaining the relationship.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The Category collection organizes products into logical groupings. Each category document includes a name, URL-friendly slug, description, image URL, and display order number. The slug enables SEO-friendly category URLs while the order field controls the sequence in which categories appear in navigation and listing interfaces.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The Notification collection stores user notifications with fields for the target user, notification type, message content, read status, and creation timestamp. Notifications are queried by user and sorted by creation time to display recent notifications first. The read status enables displaying unread notification counts and visually distinguishing new notifications.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The AdminSettings collection stores platform configuration including the list of authorized admin users, homepage content configuration, about page content, and contact page information. This collection typically contains a single document that serves as the global settings store. Centralizing these settings in the database rather than configuration files enables runtime modification through the administrative interface.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 5.5 Data Flow and Communication
      new Paragraph({
        text: "5.5 Data Flow and Communication",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "Understanding how data flows through the PlayNex system provides insight into the application's behavior and helps identify potential optimization opportunities and failure points. The data flow varies based on the type of operation but follows consistent patterns throughout the application.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "For read operations such as loading product listings, the flow begins with the user navigating to a page that requires data. The React component responsible for that page triggers a data fetch, typically in a useEffect hook that runs when the component mounts. An HTTP GET request is sent to the appropriate API endpoint, such as /api/products for product listings. The request travels from the browser to the server, where Express routing directs it to the appropriate handler.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "On the server, the handler first checks the in-memory cache for the requested data. If the data is cached and valid, it is returned immediately without querying the database. If the data is not cached, the handler queries MongoDB using Mongoose, retrieves the requested documents, stores them in the cache for future requests, and returns them in the response. The response travels back to the browser where the React component receives the data and updates its state, triggering a re-render that displays the data to the user.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "For write operations such as adding a product to the cart or submitting a review, the flow involves both sending data to the server and receiving confirmation of the operation's success. The user interacts with a form or button that triggers a submission handler. The handler collects the relevant data, performs client-side validation, and sends an HTTP POST, PUT, or DELETE request to the appropriate endpoint with the data in the request body as JSON.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The server receives the request, validates the data more thoroughly including checking authentication and authorization, performs the database operation through Mongoose, updates any affected caches, and returns a response indicating success or failure. The client receives this response and updates its state accordingly, potentially showing a success message, redirecting to another page, or displaying error information if the operation failed.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Authentication flows deserve special attention due to their security implications. When a user logs in, their credentials are sent to the authentication endpoint. The server retrieves the user record by email, compares the provided password against the stored hash using bcryptjs, and if the credentials are valid, generates a JWT containing the user's ID and role information. This token is returned to the client, which stores it in localStorage and includes it in the Authorization header of subsequent requests to protected endpoints.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Protected endpoints verify the JWT before processing requests. The token is extracted from the Authorization header, decoded and verified using the secret key, and the user information from the token payload is made available to the route handler. If the token is missing, expired, or invalid, the request is rejected with an appropriate error response. This stateless authentication approach scales well and eliminates the need for server-side session storage.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 },
      }),

      // ===== CHAPTER 6: TECHNICAL IMPLEMENTATION =====
      new Paragraph({
        text: "CHAPTER 6",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "TECHNICAL IMPLEMENTATION",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      // 6.1 Frontend Development
      new Paragraph({
        text: "6.1 Frontend Development",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The frontend development of PlayNex represents a significant undertaking that required careful attention to user experience, performance, and code quality. The implementation leverages modern React patterns and best practices to create a maintainable, performant application.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The project structure organizes code into logical directories that reflect the architecture. The src directory contains all source code, with subdirectories for components, pages, contexts, hooks, services, types, and utilities. Components are further organized by function, with separate directories for admin components, layout components, product components, and UI components. This organization enables developers to locate code quickly and understand the relationships between different parts of the application.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "TypeScript is used throughout the frontend to provide static typing and improved developer experience. Type definitions describe the shape of data structures such as products, users, and reviews, enabling the IDE to provide intelligent code completion and catching type errors at compile time rather than runtime. Custom types are defined in the types directory and imported where needed throughout the application.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The implementation of the three-dimensional product viewer required integrating React Three Fiber with the existing React application. React Three Fiber provides a declarative approach to Three.js, allowing 3D scenes to be composed using React components. The product viewer component creates a scene with appropriate lighting, loads 3D models or generates geometry based on available product data, implements camera controls for user interaction, and handles loading states and error conditions. Performance optimization was critical, including implementing level-of-detail rendering and efficient material definitions.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Animation implementation throughout the platform creates a polished, premium feel. Page transitions utilize Framer Motion's AnimatePresence component to animate content entering and leaving the DOM. Micro-interactions on buttons, cards, and other interactive elements provide visual feedback for user actions. Scroll-based animations powered by GSAP reveal content as users scroll down pages. All animations are designed to maintain 60 frames per second performance and include reduced motion support for users who prefer minimal animation.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Styling is implemented using Tailwind CSS, which provides utility classes for rapid development while maintaining design consistency. Custom configuration extends Tailwind's default theme to include the PlayNex brand colors, with the primary navy blue (#1d4ed8) featured prominently. Dark mode implementation uses Tailwind's dark variant, applying alternative colors when the dark theme is active. The combination of utility classes and custom configuration enables both rapid prototyping and refined styling.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Form handling follows consistent patterns throughout the application. Forms utilize controlled components where input values are stored in React state and updated through onChange handlers. Validation is performed both on change and on submission, with error messages displayed inline next to the relevant fields. The authentication forms, product forms in the admin panel, and review submission forms all follow these patterns, ensuring a consistent user experience.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 6.2 Backend Development
      new Paragraph({
        text: "6.2 Backend Development",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The backend development focused on creating a robust, efficient API that serves the frontend's needs while maintaining security and performance standards. The implementation follows RESTful conventions and includes careful error handling and logging.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The server entry point, implemented in instant-server.cjs, initializes the Express application and configures all necessary middleware. CORS is configured to allow requests from the frontend origin, which is essential for the separate frontend and backend deployment model. The JSON body parser is configured with appropriate size limits to handle typical request payloads including base64-encoded images while preventing abuse through excessively large requests.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Database connection is established at server startup with robust error handling and retry logic. The connection uses MongoDB Atlas's connection string, which includes authentication credentials and cluster configuration. Connection events are logged to facilitate debugging, and a periodic ping mechanism verifies that the connection remains active. If the connection is lost, automatic reconnection attempts are made with exponential backoff.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The caching system was implemented to address performance requirements. Upon successful database connection, all products are loaded into an in-memory Map structure keyed by product ID. Subsequent product queries check the cache first and return cached data when available. Cache invalidation occurs whenever products are modified through the API—create, update, and delete operations all trigger cache updates to maintain consistency. This approach reduces typical product query response times from tens of milliseconds to sub-millisecond levels.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Authentication implementation uses JSON Web Tokens with a carefully chosen expiration time that balances security and user convenience. When users authenticate successfully, a token is generated containing their user ID, email, and role information. This token is signed with a secret key stored in environment variables. Protected routes verify incoming tokens before processing requests, extracting user information for use in authorization decisions and audit logging.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Password recovery functionality was implemented using Nodemailer with Gmail SMTP. When a user requests password recovery, the system generates a secure token, stores it with an expiration time, and sends an email to the user's registered address containing a link to reset their password. The implementation uses app-specific passwords rather than the main Gmail password, following security best practices for SMTP authentication. The email is sent from zainmalik55786@gmail.com using the configured app password.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Error handling follows consistent patterns across all routes. Expected errors such as validation failures or resource not found conditions return appropriate HTTP status codes (400 for bad requests, 404 for not found, 401 for unauthorized, 403 for forbidden) with descriptive error messages in JSON format. Unexpected errors are caught by error handling middleware, logged for debugging purposes, and return generic error messages to clients to avoid leaking implementation details.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Logging throughout the backend provides visibility into server operations. Request logging shows incoming requests with their methods, paths, and relevant parameters (excluding sensitive data such as passwords). Database operations are logged at key points. The logging avoids including full image data in logs, which would bloat log files with base64-encoded strings. This logging facilitates debugging and provides an audit trail of server activity.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 6.3 Database Implementation
      new Paragraph({
        text: "6.3 Database Implementation",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "The database implementation translates the conceptual data model into working Mongoose schemas and establishes the patterns for data access throughout the application. Careful schema design ensures data integrity while leveraging MongoDB's flexibility.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The User schema implements comprehensive validation for all fields. The email field includes a regular expression validator ensuring proper email format, and a unique index prevents duplicate registrations. The password field enforces a minimum length of six characters, and the schema does not return passwords in query results unless explicitly requested. Boolean fields for isAdmin, isPermanentAdmin, and isVerified default to false, requiring explicit elevation of privileges.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The Product schema supports the hierarchical product structure through the productType enum field, which accepts values of 'parent', 'child', or 'grandchild', and the parentId field, which references the parent product for variant products. The images field is an array of strings, allowing multiple product images to be stored. The specifications field uses a flexible mixed type, allowing different products to have different specification structures—essential for a technology products catalog where specifications vary significantly between product categories.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Indexes are created on frequently queried fields to ensure good query performance. The User collection has an index on email for fast authentication lookups. The Product collection has indexes on category and parentId to support filtered queries and variant retrieval. The Review collection has a compound index on product and user to support queries for reviews by product and to check for existing reviews by a user for a product.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Schema middleware, specifically pre-save hooks, handles automatic operations that should occur before documents are saved. For users, this includes hashing passwords when they are modified—the middleware detects password changes and applies bcrypt hashing before the save operation completes. This ensures that passwords are always hashed before storage regardless of how the user document is created or modified.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Data seeding functionality populates the database with initial data for development and testing purposes. The seed script creates sample products, categories, and a default admin user, providing a starting point for development work. This script is idempotent, checking for existing data before creating new documents to prevent duplicates when run multiple times.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 6.4 Security Implementation
      new Paragraph({
        text: "6.4 Security Implementation",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "Security permeates every layer of the PlayNex platform, from user authentication through data protection to infrastructure configuration. The security implementation addresses multiple threat vectors while maintaining usability.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Authentication security begins with password handling. Passwords are never stored in plain text—they are hashed using bcryptjs with a cost factor of 10, representing a balance between security and performance. This cost factor determines the computational work required to hash a password, making brute-force attacks computationally expensive. During authentication, the provided password is hashed and compared against the stored hash, with timing-safe comparison preventing timing attacks.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "JSON Web Tokens provide stateless authentication that scales effectively. Tokens include the user ID, email, and role, allowing authorization decisions without database queries. Tokens are signed with a secret key known only to the server, preventing token forgery. Token expiration ensures that even if a token is compromised, its useful lifetime is limited. The secret key is stored in environment variables rather than source code, keeping it out of version control.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Authorization is implemented through role-based access control with three levels: regular users, administrators, and permanent administrators. Regular users can manage their own accounts, place orders, and submit reviews. Administrators can additionally manage products, categories, and view user information. Permanent administrators have all admin capabilities plus the ability to manage other administrators and cannot have their admin status revoked by other admins. Route handlers check user roles before allowing access to protected functionality.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Input validation prevents malicious data from entering the system. All user inputs are validated for type, format, and length on both the client and server sides. Client-side validation provides immediate feedback but is never trusted for security purposes since it can be bypassed. Server-side validation is authoritative and rejects invalid requests with appropriate error messages. Mongoose schema validation provides an additional layer of protection at the database level.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "CORS configuration restricts which origins can make requests to the API, preventing unauthorized cross-origin access. The configuration allows requests from the frontend origin while blocking requests from other sources. This protection is particularly important for authenticated operations where cookies or tokens might be sent automatically.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Sensitive configuration values are managed through environment variables loaded from a .env file that is excluded from version control. This approach keeps secrets such as database connection strings, JWT signing keys, and email credentials out of the codebase. The .env file contains the MongoDB URI, JWT secret, and email configuration including the sender address (zainmalik55786@gmail.com) and app password (lkjkuavqyhzghfgq). These values are accessed through process.env throughout the application.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      }),

      // 6.5 Key Features Implementation
      new Paragraph({
        text: "6.5 Key Features Implementation",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: "Several key features of PlayNex warrant detailed discussion of their implementation, as they represent significant development efforts and demonstrate important technical decisions.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The three-dimensional product viewer is implemented as a React component that encapsulates a complete Three.js scene. The component creates a WebGL renderer, sets up a scene with ambient and directional lighting optimized for product visualization, and implements OrbitControls allowing users to rotate, pan, and zoom the view. Products are represented either as 3D models loaded from files when available or as generated geometry based on product dimensions. The component handles various states including loading, ready, and error, providing appropriate visual feedback in each case.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The product variant system required careful implementation to support the parent-child-grandchild hierarchy while maintaining good query performance. When a parent product is displayed, the system retrieves all child variants in a single query using the parentId field. Color and other grandchild variants are retrieved similarly. The user interface presents these variants through intuitive selectors, with color variants shown as visual swatches and other variants as buttons or dropdowns. Selecting a variant updates the displayed images, price, and other details dynamically.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The shopping cart implementation uses React Context to provide cart functionality throughout the application. The cart state includes an array of items, each containing the product ID, selected variant information, quantity, and cached product details for display. Cart operations including add, remove, and quantity adjustment are implemented as context functions that update state and persist to localStorage. The cart calculates totals dynamically, including subtotals, any applicable discounts, and grand totals. Cart persistence ensures that users do not lose their selections across browser sessions.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The administrative interface provides comprehensive management capabilities through a series of modal dialogs and management pages. Product management includes a form for creating and editing products with fields for all product attributes, image upload supporting multiple images, variant configuration, and category assignment. Drag-and-drop functionality implemented using the dnd-kit library enables intuitive product reordering. Category management provides similar CRUD operations for product categories. User management displays registered users and enables admin privilege assignment.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The theme system implementation uses CSS custom properties (variables) combined with Tailwind's dark mode variant. Theme preference is stored in localStorage and applied at application startup before rendering to prevent flash of incorrect theme. The ThemeContext provides the current theme and toggle function to all components. Components use Tailwind classes with dark: variants to specify alternative styling for dark mode. Transitions are applied to theme-related properties to animate the theme change smoothly.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "The notification system stores notifications in MongoDB with references to the target user. When events occur that warrant notification, such as order status changes or review responses, new notification documents are created. The frontend polls for notifications periodically and displays the count of unread notifications in the navigation bar. The notification page displays all notifications for the current user with the ability to mark them as read.",
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 },
      }),

      // PART 2 END MARKER
      new Paragraph({
        text: "--- END OF PART 2 ---",
        alignment: AlignmentType.CENTER,
        pageBreakBefore: true,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: "This document continues with Chapter 7: VALIDATIONS AND CHALLENGES, Chapter 8: CONCLUSION, and Chapter 9: REFERENCES AND APPENDICES.",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Please request Part 3 to complete the report with remaining chapters.",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    ],
  }],
});

const Packer = require('docx').Packer;

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(path.join(process.cwd(), 'PlayNex_Project_Report_Part2.docx'), buffer);
  console.log('\n✅ PART 2 Document created successfully!');
  console.log('📄 File: PlayNex_Project_Report_Part2.docx');
  console.log('\n📊 Part 2 includes:');
  console.log('   • Chapter 4: SCOPE');
  console.log('     - Project Boundaries');
  console.log('     - Included Features');
  console.log('     - Limitations and Exclusions');
  console.log('   • Chapter 5: SYSTEM ARCHITECTURE');
  console.log('     - Architectural Overview');
  console.log('     - Frontend Architecture');
  console.log('     - Backend Architecture');
  console.log('     - Database Design');
  console.log('     - Data Flow and Communication');
  console.log('   • Chapter 6: TECHNICAL IMPLEMENTATION');
  console.log('     - Frontend Development');
  console.log('     - Backend Development');
  console.log('     - Database Implementation');
  console.log('     - Security Implementation');
  console.log('     - Key Features Implementation');
  console.log('\n📝 Request "part 3" for final chapters!\n');
});
