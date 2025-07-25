from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, RadioField, PasswordField
from wtforms.validators import DataRequired, Email, Length
from datetime import datetime
import uuid
from flask_login import UserMixin, LoginManager, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///safevoice.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'  # redirect here if not logged in

# User model
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Other Models
class IncidentReport(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(200))
    date_occurred = db.Column(db.DateTime)
    urgency_level = db.Column(db.String(20), nullable=False)
    contact_preference = db.Column(db.String(50))
    status = db.Column(db.String(20), default='submitted')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SafetyPlan(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    emergency_contacts = db.Column(db.Text)
    safe_places = db.Column(db.Text)
    warning_signs = db.Column(db.Text)
    coping_strategies = db.Column(db.Text)
    important_documents = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SupportService(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    service_type = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(300))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    hours = db.Column(db.String(100))
    description = db.Column(db.Text)
    province = db.Column(db.String(50))

# Forms
class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])

class IncidentReportForm(FlaskForm):
    incident_type = SelectField('Type of Incident', choices=[
        ('domestic_violence', 'Domestic Violence'),
        ('sexual_assault', 'Sexual Assault'),
        ('harassment', 'Harassment'),
        ('stalking', 'Stalking'),
        ('other', 'Other')
    ], validators=[DataRequired()])
    description = TextAreaField('Description', validators=[DataRequired(), Length(min=10)])
    location = StringField('Location (Optional)')
    urgency_level = RadioField('Urgency Level', choices=[
        ('low', 'Low - Not immediate danger'),
        ('medium', 'Medium - Ongoing concern'),
        ('high', 'High - Immediate help needed')
    ], validators=[DataRequired()])
    contact_preference = SelectField('How would you like to be contacted?', choices=[
        ('none', 'Do not contact me'),
        ('phone', 'Phone call'),
        ('email', 'Email'),
        ('text', 'Text message')
    ])

class SafetyPlanForm(FlaskForm):
    emergency_contacts = TextAreaField('Emergency Contacts', description='List trusted people you can contact in an emergency')
    safe_places = TextAreaField('Safe Places', description='Places where you feel safe and can go if needed')
    warning_signs = TextAreaField('Warning Signs', description='Signs that indicate your safety may be at risk')
    coping_strategies = TextAreaField('Coping Strategies', description='Healthy ways to cope with stress and difficult situations')
    important_documents = TextAreaField('Important Documents', description='List of important documents and where they are stored')

# Require login for all routes except login, register, and static
@app.before_request
def require_login():
    allowed_routes = ['login', 'register', 'static']
    if request.endpoint not in allowed_routes and not current_user.is_authenticated:
        return redirect(url_for('login'))

# Routes for auth
@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        if User.query.filter_by(email=form.email.data).first():
            flash('Email already registered', 'danger')
            return redirect(url_for('register'))
        if User.query.filter_by(username=form.username.data).first():
            flash('Username already taken', 'danger')
            return redirect(url_for('register'))
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            flash('Logged in successfully!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
        flash('Invalid credentials', 'danger')
    return render_template('login.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out.', 'info')
    return redirect(url_for('login'))

# Your existing app routes below

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/emergency')
def emergency():
    emergency_contacts = [
        {'name': 'SAPS Emergency', 'number': '10111', 'description': '24/7 Police emergency line', 'type': 'police'},
        {'name': 'GBV Command Centre', 'number': '0800 428 428', 'description': '24/7 GBV support and reporting', 'type': 'gbv'},
        {'name': 'Lifeline Counselling', 'number': '0861 322 322', 'description': '24/7 Crisis counselling and support', 'type': 'counselling'}
    ]
    return render_template('emergency.html', contacts=emergency_contacts)

@app.route('/report-incident', methods=['GET', 'POST'])
def report_incident():
    form = IncidentReportForm()
    if form.validate_on_submit():
        report = IncidentReport(
            incident_type=form.incident_type.data,
            description=form.description.data,
            location=form.location.data,
            urgency_level=form.urgency_level.data,
            contact_preference=form.contact_preference.data
        )
        db.session.add(report)
        db.session.commit()
        flash('Your report has been submitted safely and confidentially. Case ID: ' + report.id[:8], 'success')
        return redirect(url_for('report_success', case_id=report.id))
    return render_template('report_incident.html', form=form)

@app.route('/report-success/<case_id>')
def report_success(case_id):
    report = IncidentReport.query.get_or_404(case_id)
    return render_template('report_success.html', report=report)

@app.route('/find-services')
def find_services():
    services = SupportService.query.all()
    return render_template('find_services.html', services=services)

@app.route('/safety-planning', methods=['GET', 'POST'])
def safety_planning():
    form = SafetyPlanForm()
    if form.validate_on_submit():
        plan = SafetyPlan(
            emergency_contacts=form.emergency_contacts.data,
            safe_places=form.safe_places.data,
            warning_signs=form.warning_signs.data,
            coping_strategies=form.coping_strategies.data,
            important_documents=form.important_documents.data
        )
        db.session.add(plan)
        db.session.commit()
        session['safety_plan_id'] = plan.id
        flash('Your safety plan has been created successfully.', 'success')
        return redirect(url_for('view_safety_plan', plan_id=plan.id))
    return render_template('safety_planning.html', form=form)

@app.route('/safety-plan/<plan_id>')
def view_safety_plan(plan_id):
    plan = SafetyPlan.query.get_or_404(plan_id)
    return render_template('view_safety_plan.html', plan=plan)

@app.route('/chat')
def chat():
    return render_template('chat.html')

@app.route('/track-progress')
def track_progress():
    return render_template('track_progress.html')

@app.route('/resources')
def resources():
    return render_template('resources.html')

@app.route('/legal-resources')
def legal_resources():
    return render_template('legal_resources.html')

@app.route('/community-forum')
def community_forum():
    return render_template('community_forum.html')

# Initialize database and seed SupportService data
def init_db():
    with app.app_context():
        db.create_all()

        if SupportService.query.count() == 0:
            services = [
                SupportService(
                    name="People Opposing Women Abuse (POWA)",
                    service_type="Counselling & Legal Support",
                    address="Johannesburg, Gauteng",
                    phone="011 642 4345",
                    email="info@powa.co.za",
                    hours="Monday-Friday 8AM-5PM",
                    description="Provides counselling, legal advice, and support for women experiencing abuse.",
                    province="Gauteng"
                ),
                SupportService(
                    name="Rape Crisis Cape Town Trust",
                    service_type="Crisis Support",
                    address="Cape Town, Western Cape",
                    phone="021 447 9762",
                    email="info@rapecrisis.org.za",
                    hours="24/7 Crisis Line",
                    description="24-hour crisis support for survivors of sexual violence.",
                    province="Western Cape"
                ),
                SupportService(
                    name="Childline South Africa",
                    service_type="Child Protection",
                    address="National",
                    phone="08000 55 555",
                    email="info@childlinesa.org.za",
                    hours="24/7",
                    description="Free counselling and support for children and teens.",
                    province="National"
                )
            ]
            for service in services:
                db.session.add(service)
            db.session.commit()

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
