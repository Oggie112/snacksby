# Architecture Decision Record (ADR) for Snacksby

## 1. Context and Problem Statement

### 1.1 Background
- Snacksby is a collaborative meal planning and recipe sharing app designed primarily for couples and families.
- The app must enable users to add recipes, generate meal plans, and create unified shopping lists accessible by all household members.
- The MVP focuses on simplicity, offline-readiness for shopping and recipe viewing, and real-time syncing of meal plans across household members.
- Technical challenges include selecting a suitable frontend and backend stack that balances ease of development, scalability, offline functionality, and integration with AI-based recipe suggestion features.
- Constraints include a zero budget, limited development time, and the desire to learn new technologies such as Next.js and GraphQL.

### 1.2 Problem Definition
- Choose an architecture that supports:
  - Real-time collaboration and data synchronization between household members.
  - Offline usage for shopping lists and recipe viewing.
  - Integration with AI tools for advanced recipe suggestions (post-MVP).
  - Easy scalability and maintainability.
  - Modern frontend technologies with good developer experience.
  - Learning opportunity for Next.js, GraphQL, and related tech.

## 2. Decision Drivers

### 2.1 Technical Constraints
- Must use TypeScript for type safety.
- Offline capability for shopping list and recipes.
- Authentication and user management with minimal backend setup.
- GraphQL preferred for API interactions.
- Support for AI integration via OpenAI and Langchain (post-MVP).
- Hosting on free or low-cost cloud platforms (e.g., Vercel, Render, or AWS free tier).
- Need for good developer tooling: linting, testing, documentation.

### 2.2 Business Constraints
- Zero budget, development in spare time.
- Time to market prioritized.
- Scalability for small-to-medium household groups.
- Minimal operational overhead.

## 3. Considered Alternatives

### 3.1 Alternative 1: Next.js Fullstack + Supabase Backend + Apollo Client

**Description:**  
Use Next.js as a fullstack framework with React frontend and API routes for backend logic. Use Supabase for authentication and database with its GraphQL API. Apollo Client for GraphQL data fetching and state management.

**Pros:**  
- Fullstack framework handles routing, SSR, and API backend seamlessly.  
- Supabase handles backend as a service with auth and DB, minimizing backend coding.  
- Apollo Client offers powerful GraphQL querying and state management integration.  
- Supports offline and online syncing with appropriate cache policies.  
- Good ecosystem for learning Next.js, React, GraphQL.  

**Cons:**  
- Some complexity integrating Apollo with Supabase GraphQL.  
- Learning curve with multiple new technologies at once.  
- Potential cold start issues depending on hosting choice.  

**Fit with requirements:**  
Strong match, supports all MVP features and future AI integration.

### 3.2 Alternative 2: Vite + React Frontend + Supabase Backend (REST or GraphQL) + Custom State Management

**Description:**  
Use Vite as a fast build tool with React frontend, Supabase backend, but manage GraphQL queries with lightweight libraries or REST endpoints. Use React context or Zustand for state.

**Pros:**  
- Lightweight and fast frontend build tool.  
- Easier to start for frontend-only development.  
- Less complexity if no SSR required.  

**Cons:**  
- No built-in routing or backend API support. Requires separate backend setup.  
- More work to sync offline data and authentication flows.  
- More fragmented stack, less “batteries included”.  

**Fit with requirements:**  
Works for frontend-heavy apps, but may increase complexity for collaborative features and offline syncing.

### 3.3 Alternative 3: React Native Mobile App + Supabase + Apollo Client

**Description:**  
Build a native mobile app with React Native, using Supabase backend and Apollo Client for data.

**Pros:**  
- Native mobile experience, better offline support.  
- Access to device hardware (camera, barcode scanner).  
- Future-proof for mobile users.  

**Cons:**  
- Steeper learning curve if unfamiliar with React Native.  
- Requires mobile app deployment processes.  
- Longer development time.  

**Fit with requirements:**  
Better for post-MVP mobile focus, not ideal for quick MVP web launch.

## 4. Decision Outcome

### 4.1 Chosen Alternative

**Next.js Fullstack + Supabase Backend + Apollo Client**

- Use Next.js to manage routing, backend API, and frontend rendering.  
- Use Supabase for authentication and PostgreSQL database with GraphQL interface.  
- Use Apollo Client for GraphQL queries and state management in React.  
- Leverage Next.js ISR/SSR capabilities for performance.  
- Use Tailwind + DaisyUI for UI.  
- Deploy on Vercel for streamlined hosting and free tier benefits.

### 4.2 Positive Consequences

- Faster development with integrated frontend/backend.  
- Great learning opportunity for Next.js and GraphQL.  
- Scalable architecture supporting future AI integration.  
- Good offline support with client cache and service workers.  
- Minimal backend coding required thanks to Supabase.  

### 4.3 Negative Consequences

- Potential complexity in syncing Apollo cache with Supabase GraphQL.  
- Learning multiple technologies concurrently may slow initial progress.  
- Some reliance on Supabase uptime and limits.  

## 5. Technical Architecture

### 5.1 System Components

- **Frontend**: Next.js React components, pages, and Apollo Client.  
- **Backend**: Supabase PostgreSQL database, GraphQL API, authentication.  
- **AI Services**: OpenAI and Langchain integrations (post-MVP).  
- **Hosting**: Vercel for Next.js deployment.

### 5.2 Technical Interfaces

- GraphQL queries and mutations via Apollo Client.  
- REST APIs from Supabase where needed (auth).  
- OpenAI API calls via backend API routes.

### 5.3 Performance Considerations

- Client-side caching with Apollo Client.  
- Incremental Static Regeneration (ISR) in Next.js for static data.  
- Offline usage with service workers for shopping list and recipes.

### 5.4 Security Architecture

- Supabase handles auth and session management.  
- Role-based access control for Admin, Contri
