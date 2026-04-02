"""Root WSGI entrypoint for Azure App Service and Gunicorn."""

from backend.app import create_app

app = create_app()
application = app

if __name__ == "__main__":
    app.run()
