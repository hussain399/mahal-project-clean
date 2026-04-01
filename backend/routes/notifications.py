import smtplib, os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

SMTP_USER = os.getenv("MAIL_USERNAME")
SMTP_PASS = os.getenv("MAIL_PASSWORD")

ADMIN_EMAILS = [
    "mahal.notifications@gmail.com"  # ✅ REAL EMAIL
]

def send_admin_notification(role, entity_id, section, target_row_id=None):
    section_map = {
        "basic": "Basic Profile",
        "org": "Organization Details",
        "address": "Address Details",
        "bank": "Bank Details",
        "files": "Documents",
        "branch": "Branch Details",
        "store": "Store Details",
    }

    # normalize section key
    base_section = section.lower().split()[0]
    readable = section_map.get(base_section, section)

    # Branch / Store display
    if base_section == "branch":
        readable = (
            f"Branch (ID: {target_row_id})"
            if target_row_id
            else "Branch (New)"
        )

    if base_section == "store":
        readable = (
            f"Store (ID: {target_row_id})"
            if target_row_id
            else "Store (New)"
        )

    html = f"""
    <h2>🔔 New Profile Change Request</h2>
    <p><b>Role:</b> {role.title()}</p>
    <p><b>ID:</b> {entity_id}</p>
    <p><b>Change Type:</b> {readable}</p>

    <a href="http://localhost:3000/admin/profile-changes">
      👉 Open Admin Panel
    </a>
    """

    send_mail(
        to_email="aniljalliagampala@gmail.com",
        subject=f"{role.title()} – {readable} Change Request",
        html_body=html
    )

def send_mail(to_email, subject, html_body):
    if not SMTP_USER or not SMTP_PASS:
        raise Exception("MAIL credentials missing")

    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(html_body, "html"))

    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    server.starttls()
    server.login(SMTP_USER, SMTP_PASS)
    server.send_message(msg)
    server.quit()