import json
import os
import secrets

from flask import (
    Flask,
    flash,
    redirect,
    render_template_string,
    request,
    session,
    url_for,
)

app = Flask(__name__)

# নিরাপদ random secret key
app.secret_key = os.environ.get("SECRET_KEY") or secrets.token_hex(32)

DATA_FILE = "users.json"


# =========================
# USER DATA FUNCTIONS
# =========================

def load_users():
    if not os.path.exists(DATA_FILE):
        return {}

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)

            if isinstance(data, dict):
                return data

            return {}

    except (json.JSONDecodeError, OSError):
        return {}


def save_users(users):
    try:
        temp_file = DATA_FILE + ".tmp"

        with open(temp_file, "w", encoding="utf-8") as file:
            json.dump(
                users,
                file,
                indent=4,
                ensure_ascii=False
            )

        os.replace(temp_file, DATA_FILE)

    except OSError:
        raise


# =========================
# BASE HTML
# =========================

BASE_LAYOUT = """
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width,
        initial-scale=1.0"
    >

    <title>{{ title }}</title>

    <style>

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family:
                "Segoe UI",
                Tahoma,
                Geneva,
                Verdana,
                sans-serif;
        }

        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;

            background:
                linear-gradient(
                    135deg,
                    #667eea 0%,
                    #764ba2 100%
                );
        }

        .card {
            width: 100%;
            max-width: 430px;

            background: #ffffff;

            padding: 30px;

            border-radius: 14px;

            box-shadow:
                0 15px 35px
                rgba(0, 0, 0, 0.20);

            text-align: center;
        }

        h2 {
            margin-bottom: 22px;
            color: #333333;
            font-size: 25px;
        }

        .form-group {
            margin-bottom: 15px;
            text-align: left;
        }

        input {
            width: 100%;

            padding: 13px 15px;

            border: 1px solid #dddddd;
            border-radius: 7px;

            font-size: 15px;

            outline: none;

            transition: 0.25s;
        }

        input:focus {
            border-color: #667eea;

            box-shadow:
                0 0 7px
                rgba(102, 126, 234, 0.30);
        }

        .btn {
            display: block;

            width: 100%;

            padding: 13px;

            margin-top: 10px;

            border: none;
            border-radius: 7px;

            background: #667eea;

            color: #ffffff;

            font-size: 16px;
            font-weight: bold;

            cursor: pointer;

            text-decoration: none;

            transition: 0.25s;
        }

        .btn:hover {
            background: #5a67d8;
        }

        .logout-btn {
            background: #e53e3e;
            margin-top: 22px;
        }

        .logout-btn:hover {
            background: #c53030;
        }

        .flash {
            background: #fed7d7;
            color: #9b2c2c;

            padding: 11px;

            border-radius: 7px;

            margin-bottom: 15px;

            font-size: 14px;

            text-align: left;
        }

        .success {
            background: #c6f6d5;
            color: #276749;
        }

        p {
            margin-top: 17px;

            font-size: 14px;

            color: #666666;

            line-height: 1.5;
        }

        a {
            color: #667eea;
            text-decoration: none;
            font-weight: bold;
        }

        a:hover {
            text-decoration: underline;
        }

        .user-info {
            text-align: left;
            margin-top: 10px;
        }

        .user-row {
            padding: 12px;

            margin-bottom: 10px;

            background: #f7f7f7;

            border-radius: 7px;

            color: #333333;
        }

        .label {
            font-weight: bold;
            color: #555555;
        }

        .logo {
            font-size: 32px;
            margin-bottom: 8px;
        }

    </style>
</head>

<body>

    <div class="card">

        {% if title == "Create Account" %}
            <div class="logo">📝</div>
        {% elif title == "Login" %}
            <div class="logo">🔐</div>
        {% else %}
            <div class="logo">👋</div>
        {% endif %}

        <h2>{{ title }}</h2>

        {% with messages = get_flashed_messages(with_categories=true) %}

            {% if messages %}

                {% for category, message in messages %}

                    <div
                        class="flash
                        {% if category == 'success' %}
                        success
                        {% endif %}"
                    >
                        {{ message }}
                    </div>

                {% endfor %}

            {% endif %}

        {% endwith %}

        {% block content %}{% endblock %}

    </div>

</body>

</html>
"""


# =========================
# REGISTER PAGE
# =========================

REGISTER_TEMPLATE = BASE_LAYOUT.replace(
    "{% block content %}{% endblock %}",
    """

<form method="POST" action="{{ url_for('register') }}">

    <div class="form-group">
        <input
            type="text"
            name="first_name"
            placeholder="First Name"
            maxlength="50"
            autocomplete="given-name"
            required
        >
    </div>

    <div class="form-group">
        <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            maxlength="50"
            autocomplete="family-name"
            required
        >
    </div>

    <div class="form-group">
        <input
            type="email"
            name="email"
            placeholder="Email Address"
            maxlength="120"
            autocomplete="email"
            required
        >
    </div>

    <div class="form-group">
        <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            maxlength="20"
            autocomplete="tel"
            required
        >
    </div>

    <div class="form-group">
        <input
            type="password"
            name="password"
            placeholder="Password"
            minlength="6"
            autocomplete="new-password"
            required
        >
    </div>

    <button
        type="submit"
        class="btn"
    >
        Register
    </button>

</form>

<p>
    Already have an account?
    <a href="{{ url_for('login') }}">
        Login here
    </a>
</p>

"""
)


# =========================
# LOGIN PAGE
# =========================

LOGIN_TEMPLATE = BASE_LAYOUT.replace(
    "{% block content %}{% endblock %}",
    """

<form method="POST" action="{{ url_for('login') }}">

    <div class="form-group">

        <input
            type="email"
            name="email"
            placeholder="Email Address"
            maxlength="120"
            autocomplete="email"
            required
        >

    </div>

    <div class="form-group">

        <input
            type="password"
            name="password"
            placeholder="Password"
            autocomplete="current-password"
            required
        >

    </div>

    <button
        type="submit"
        class="btn"
    >
        Login
    </button>

</form>

<p>
    Don't have an account?
    <a href="{{ url_for('register') }}">
        Register here
    </a>
</p>

"""
)


# =========================
# HOME / DASHBOARD
# =========================

HOME_TEMPLATE = BASE_LAYOUT.replace(
    "{% block content %}{% endblock %}",
    """

<div class="user-info">

    <div class="user-row">
        <span class="label">Name:</span><br>
        {{ user.first_name }} {{ user.last_name }}
    </div>

    <div class="user-row">
        <span class="label">Email:</span><br>
        {{ user.email }}
    </div>

    <div class="user-row">
        <span class="label">Phone:</span><br>
        {{ user.phone }}
    </div>

</div>

<a
    href="{{ url_for('logout') }}"
    class="btn logout-btn"
>
    Logout
</a>

"""
)


# =========================
# HOME ROUTE
# =========================

@app.route("/")
def home():

    if "user_email" not in session:
        return redirect(url_for("login"))

    email = session["user_email"]

    users = load_users()

    user_data = users.get(email)

    if not user_data:
        session.pop("user_email", None)

        flash(
            "Your session is no longer valid.",
            "error"
        )

        return redirect(url_for("login"))

    return render_template_string(
        HOME_TEMPLATE,
        title="Welcome Dashboard",
        user=user_data
    )


# =========================
# REGISTER ROUTE
# =========================

@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        first_name = request.form.get(
            "first_name",
            ""
        ).strip()

        last_name = request.form.get(
            "last_name",
            ""
        ).strip()

        email = request.form.get(
            "email",
            ""
        ).strip().lower()

        phone = request.form.get(
            "phone",
            ""
        ).strip()

        password = request.form.get(
            "password",
            ""
        )

        # Basic validation

        if not first_name:
            flash(
                "Please enter your first name.",
                "error"
            )
            return redirect(url_for("register"))

        if not last_name:
            flash(
                "Please enter your last name.",
                "error"
            )
            return redirect(url_for("register"))

        if not email:
            flash(
                "Please enter your email.",
                "error"
            )
            return redirect(url_for("register"))

        if not phone:
            flash(
                "Please enter your phone number.",
                "error"
            )
            return redirect(url_for("register"))

        if len(password) < 6:
            flash(
                "Password must be at least 6 characters.",
                "error"
            )
            return redirect(url_for("register"))

        users = load_users()

        # Check existing email

        if email in users:

            flash(
                "This email is already registered!",
                "error"
            )

            return redirect(
                url_for("register")
            )

        # Create user (Plain Text Password)

        users[email] = {

            "first_name": first_name,

            "last_name": last_name,

            "email": email,

            "phone": phone,

            "password": password

        }

        save_users(users)

        flash(
            "Registration successful! Please login.",
            "success"
        )

        return redirect(url_for("login"))

    return render_template_string(
        REGISTER_TEMPLATE,
        title="Create Account"
    )


# =========================
# LOGIN ROUTE
# =========================

@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        email = request.form.get(
            "email",
            ""
        ).strip().lower()

        password = request.form.get(
            "password",
            ""
        )

        users = load_users()

        user = users.get(email)

        # Direct string comparison for password
        if user and user.get("password") == password:

            session.clear()

            session["user_email"] = email

            return redirect(
                url_for("home")
            )

        flash(
            "Invalid email or password!",
            "error"
        )

        return redirect(
            url_for("login")
        )

    return render_template_string(
        LOGIN_TEMPLATE,
        title="Login"
    )


# =========================
# LOGOUT ROUTE
# =========================

@app.route("/logout")
def logout():

    session.clear()

    flash(
        "You have been logged out.",
        "success"
    )

    return redirect(
        url_for("login")
    )


# =========================
# RUN SERVER
# =========================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
)
