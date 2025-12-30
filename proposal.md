7. Key Features & Requirements
7.1. Key Features
Online Seat Reservation
Users can monitor seat availability through the seating map.
They can book their preferred seat online.
Online Payment
 Integrated payment via e-wallets and bank cards for user convenience.
AI-based Human Recognition
By analyzing images extracted from cameras, the system sends notifications to administrators, helping optimize space management.
AI Chat bot
 The AI chat bot assists users with quick actions such as real-time interaction, usage guidance, or answering frequently asked questions.
7.2. Functional Requirements(FR)
FR01: User Registration & Login 
Users can register a new account, log in, recover passwords, and log out.
Basic role-based access control is supported (user/admin).
FR02: View & Select Service Packages
Users can browse the list of service packages, view details, compare, and purchase/subscribe to a package.
FR03: Seat/Room Reservation on Space Map 
Users select a location on the space map, choose a time slot/date, and submit a booking request.
The system checks and confirms availability.
FR04: Online Payment
 The system supports payments via integrated gateways (Momo, ZaloPay, bank cards, etc.), and processes transaction status (success/failure).
FR05: Generate & Send QR Code
After successful booking/payment, the system generates a unique QR code for the booking and sends it to the user (via email or account).
FR06: QR-based Check-in
Users check in at the venue by scanning the QR code if registered.
The system verifies and updates the status.
FR07: User Notifications
The system sends emails/notifications for booking confirmation, payment receipts, arrival reminders, and promotions.
FR08: Admin Login
Administrators log in to the admin interface with extended management privileges.
FR09: User Management
Administrators can view, edit, disable, or delete user accounts; and review booking and transaction history.
FR10: Space Map Management
Administrators can add/edit/delete seats or meeting rooms, update area status, and modify the layout (map).
FR11: Service Package Management
Administrators can add/edit/delete service packages, pricing, descriptions, and applicable conditions.
FR12: Payment & Invoice Management
Administrators can view, support, and handle user-reported issues related to payments.
FR13: Summary Reports
The system provides reports on: number of users, number of bookings, revenue, and utilization rate over time. The system can export reports to CSV/PDF for Administrators.
FR14: Space Management (AI-supported)
With AI-based human recognition, the system detects whether rooms are vacant or occupied.
FR15: Chat bot AI
The user can be interaction with an AI chat bot. The user can chat and get support, usage guidance, or answers to frequently asked questions.
FR16: Notification Service
Administrators can be received notifications about Space Management, Seat/Room Reservations or warning notice about system. Administrators can follow and management easier and correctly.
FR17: Usage History Tracking
User can access their booking history to ensure transparency.
FR18: Dashboard & Statistical Reports
Administrators can view an overview all of the system.
FR 19: Give Feedback
User can send feedback or a review about the service.
7.3. Non-Functional Requirements(NFR)
NFR01: Performance
The system must respond to booking operations within ≤ 3 seconds.
The system must respond to booking operations within ≤ 3 seconds.
NFR02: Security
All personal data and payment information must be encrypted.
User authentication requires strong passwords or OTP at login.
Access rights are clearly defined: user vs. administrator.
NFR03: Usability
The interface must be user-friendly and intuitive.
Features should be easy to use.
NFR04: Reliability
The system uptime must reach ≥ 99%
NFR05: Scalability.
The system must handle 100 → 10,000 users without performance degradation.
NFR06: Maintainability
The codebase must be clear and easily extendable.
A logging mechanism should exist for administrators to quickly detect and resolve errors.
NFR07: Compatibility
The system must be compatible with major browsers (Chrome, Edge, Firefox, Safari).
NFR08: Availability
The system must operate 24/7, especially during peak hours (8 AM – 10 PM).
Daily data backups must be maintained to minimize data loss risks.
NFR09: Privacy
AI recognition images and data are stored temporarily for management purposes only and must not be shared externally.
The system must comply with personal data protection regulations.
8. Constraints and Assumptions
8.1. Constraints
Time: Must be completed within ~4 months (capstone timeline)
Tools & Technologies: Limited to agreed stack:
Frontend: HTML/CSS.
Backend: Node.js (Express/Net.js) or Django(Python).
Database: PostgreSQL/MySQL
Git/GitHub, VS Code.
Equipment: Team members’ personal laptops/PCs for dev, testing, demo.
Human Resources: Junior → intermediate team with limited real-world deployment experience.
AI: YOLOv8 at simulation/demo level, not commercial scale.
8.2. Assumptions
-System users have stable Internet connectivity.
-Users possess modern devices (smartphone, laptop/PC) to access the web application.
-The development team has basic to intermediate proficiency in the chosen technologies (HTML/CSS, Node.js, Django, PostgreSQL/MySQL, YOLOv8) and can self-learn additional skills when needed.
-The working and deployment environment (hosting, server, database) will remain stable throughout the development and testing phases.
-Simulated data and applicable regulations related to Co-working/study spaces will be updated from reliable and legal sources.
9. Target Users / Stakeholders
9.1. Target Users
-Target Audience: Students, freelancers, office workers, or any individuals requiring flexible study and working spaces
-Age: 18 – 40years old
-Tech Proficiency: Basic to intermediate; familiar with using smartphones or computers for booking, online payment, and QR code scanning
-Benefits the System Provides
Easy, fast, real-time booking of seats or study/group rooms.
Secure and convenient online payment via e-wallets (Momo, ZaloPay) or bank cards.
Automated check-in/out via QR code or facial recognition, saving time.
Receive reminders, promotions, or violation alerts.
Track booking and payment history for transparency and personal expense management.
9.2. Other Stakeholders
-Project Development Team: Responsible for system design, programming, testing, and deployment.
-Project Management/Oversight: Tracks progress, ensures requirements and deadlines are met.
-Space Owners/Managers: Manage users, revenue, seats/rooms, and send notifications to customers.
-Payment Service Providers (Momo, ZaloPay, Banks, etc.): Provide secure and fast payment infrastructure.
-AI Technology Providers (Cameras, Facial Recognition AI): Support technology for seat detection and facial recognition.
-Benefits for Stakeholders:
Development Team: Opportunity to apply programming, AI, and project management skills in a real-world environment.
Project Management/Oversight: Gain clear insight into project progress and quality for effective evaluation.
Space Owners/Managers: Reduce staffing costs, improve management efficiency, enable 24/7 operations.
Payment Providers: Expand customer base, increase revenue from online transactions.
AI Providers: Opportunity to deploy, test, and expand real-world applications of AI technology.
10. Technology Stack
10.1. Frontend
-HTML/CSS: Build user-facing interface and display.
-React.js/Next.js: For building dynamic and responsive user interfaces.
10.2. Backend
-Node.js (Express.js / NextJS): For server-side logic and API development.
-Python: For integrating e-wallet APIs (Momo, ZaloPay, VNPay).
10.3. Database
-PostgreSQL: Relational database for managing user accounts, seat/room data, bookings, and financial transactions
10.4. AI module
-YOLOv8 (You Only Look Once, version 8): For real-time object detection using camera-extracted images to recognize people and determine whether a room is occupied or available
10.5. Support Tools
-Discord, Google Meet: For team communication and collaboration
-Jira: For task tracking and sprint management
-Git (GitHub): For version control with shared repositories
12.2. System Context Description
-User 
Users can register / log in to the system.
Users can view and select appropriate service packages.
Users can reserve a seat or meeting room on the workspace map.
Users can make online payments for service packages or reservations.
Users can check-in by scanning the QR code at the check-in point.
Users can receive notifications (via email) about information of reservations, payments, and reminders.
Users can provide comments & feedback regarding service quality, workspace environment, and application experience to help the system and administrators improve services.
User can interact with chat bot AI, chat and get support, usage guidance, or answers to frequently asked questions.
User can access their booking history to ensure transparency.
-Administrators
Administrators can log in to the admin system.
Administrators can edit, delete, or view customer information.
Administrators can manage workspace layout (seats, meeting rooms, areas).
Administrators can add, edit, delete, or manage service packages.
Administrators can view, review, and process payments & invoices.
Administrators can view aggregated reports: number of users, revenue, utilization rate and receive reports to CSV/PDF.
Administrators can receive system alerts regarding incidents, service status, or user feedback.
Administrators can view an overview all of the system from dashboard
-External Services
Payment Gateways (Momo, Zalo Pay, etc.): Receive payment transaction requests from the system and return transaction results (success/failure), along with transaction ID.
Email/Notification Services: Receive notification requests from the system and send notifications (emails) directly to users.
Chat bot AI: 
13. Potential Risk & Mitigation Strategies
13.1. Potential Risks
-Lack of training data may lead to low accuracy in detecting occupied/available rooms.
-YOLOv8 technology is relatively new; the team has limited experience in deployment and optimization
-Heavy workload (data preparation, training, testing, integration) may cause project delays
-Technical issues or compatibility errors between the AI model and the management system
-Project scope changes due to new, unplanned requirements
-Limited budget for computational infrastructure, especially GPUs for training
-Misclassification errors (e.g., mistaking an available room for occupied or vice versa)
13.2. Mitigation Strategies
-Collect additional real-world data, apply data augmentation, and leverage public datasets
-Actively study YOLOv8 documentation, engage with AI communities, assign dedicated members, and seek expert support if necessary
-Break down tasks, prioritize core features, allocate buffer time, and monitor progress regularly
-Perform early integration testing; prepare fallback solutions (e.g., simple sensors as temporary substitutes)
-Clearly define project scope from the start; only consider expansion after evaluating impact and resources
-Use flexible paid cloud services, optimize the model to reduce resource consumption, and combine cloud with on-premise infrastructure
-Conduct extensive real-world testing, periodically fine-tune the model, and enhance training data to minimize errors