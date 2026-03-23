# CivicTrack--Local-Issue-Reporting-and-Priority-System

CivicTrack is a simple web application that allows users to report local issues such as garbage problems, traffic congestion, accidents, and public infrastructure faults. The system helps authorities manage and prioritize these issues efficiently.

This project demonstrates a basic implementation of a full-stack application using Flask and SQLite, along with a rule-based priority detection system.

Features
User Registration and Login
Issue Reporting with title, description, location, and image upload
Automatic Priority Detection (High, Medium, Low)
Admin Dashboard to view and manage issues
Issue Status Updates (Pending, In Progress, Resolved)
Clean and Simple User Interface
How It Works
The user registers and logs into the system.
The user submits an issue through a reporting form.
The system analyzes the description and assigns a priority.
The issue is stored in the database.
The admin views all issues in the dashboard.
The admin updates the issue status based on progress.
Technologies Used

Frontend

HTML
CSS
JavaScript

Backend

Python
Flask

Database

SQLite
Project Structure

civictrack

backend/

app.py
database.db
utils.py

frontend/

templates/
index.html
login.html
register.html
dashboard.html
static/
css/
style.css
js/
script.js
uploads/

README.md

Installation and Setup
Clone the repository

git clone https://github.com/your-username/civictrack.git

Navigate to the backend folder

cd backend

Install dependencies

pip install flask

Run the application

python app.py

Open your browser and go to

http://127.0.0.1:5000

Example Output

Issue Title: Garbage Overflow
Priority: Medium
Status: Pending

Issue Title: Road Accident
Priority: High
Status: In Progress

Future Improvements
Add map-based location tracking
Use machine learning for better priority prediction
Add email or SMS notifications
Role-based authentication system
Mobile responsive enhancements
Author

Developed as a prototype project for demonstrating local issue reporting and prioritization using a full-stack approach.
