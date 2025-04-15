import os
import sys
import django

# إضافة المسار الجذر للمشروع إلى sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# إعداد بيئة Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'binc_b.settings')
django.setup()

from core.models import User

def create_admin_user():
    username = "admin"
    email = "admin@example.com"
    password = "admin123"

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            user_type="admin"
        )
        print(f"Admin user '{username}' created successfully.")
    else:
        print(f"Admin user '{username}' already exists.")

if __name__ == "__main__":
    create_admin_user()
