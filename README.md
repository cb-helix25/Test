# CallHub Web App

A real-time call handling system with logic tree visualization and JSON preview.

**Live Demo:** https://yellow-moss-0a7f0a803.1.azurestaticapps.net

**Test API data for client lookup:**
phone: '1234567890'
name: 'John Doe',
email: 'john.doe@example.com',

**Automated Contact + Response Time Tracking:**
1. Frontend Capture 
New field: “Is this a client?”
Yes → ask “Do you prefer contact by email or phone?”
No → ask “What is the relationship with the firm?”
Options: prospect, opponent, opponent solicitor, barrister, expert, other.
(default = send Teams message + email to FE)
 
 2. Client (Yes) Flow 
Prefers Email
Auto-send email acknowledging call + include link to book call (Calendly).
Teams message sent to FE.
Prefers Phone
Auto-send SMS acknowledging call + link to book call.
Teams message sent to FE.
 
 3. Non-client (No) Flow 
Prospect
Auto-send email + SMS: “Thanks for your enquiry, passed to team, you’ll be contacted shortly. If no response within 1hr (business hours) click here.”
Triggers:
Hunter card update (“please claim”).
Alert: AC for Property enquiries / JW for Construction enquiries.
Opponent / Opponent solicitor / Barrister / Expert / Other
Default: Teams message + email to FE.