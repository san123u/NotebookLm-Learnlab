#!/usr/bin/env python3
"""
Project Initialization Script

This script initializes a new project from the core platform template.
It renames the project, updates configuration files, and prepares
the environment for development.

Usage:
    python init-project.py --name "My App" --slug my-app
"""

import argparse
import os
import re
import secrets
import shutil
import sys
from pathlib import Path


def generate_secret_key(length: int = 32) -> str:
    """Generate a secure random hex key."""
    return secrets.token_hex(length)


def snake_case(text: str) -> str:
    """Convert text to snake_case."""
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '_', text)
    return text.lower()


def replace_in_file(file_path: Path, replacements: dict[str, str]) -> bool:
    """Replace text patterns in a file."""
    try:
        content = file_path.read_text()
        original = content
        for old, new in replacements.items():
            content = content.replace(old, new)
        if content != original:
            file_path.write_text(content)
            return True
        return False
    except Exception as e:
        print(f"  Warning: Could not process {file_path}: {e}")
        return False


def create_env_file(project_root: Path, app_name: str, slug: str) -> None:
    """Create .env file from .env.example with generated values."""
    env_example = project_root / ".env.example"
    env_file = project_root / ".env"

    if env_file.exists():
        print("  .env file already exists, skipping...")
        return

    if not env_example.exists():
        print("  Warning: .env.example not found")
        return

    content = env_example.read_text()

    # Generate secure values
    jwt_secret = generate_secret_key(32)
    mongo_password = generate_secret_key(16)

    replacements = {
        'APP_NAME="Core Platform"': f'APP_NAME="{app_name}"',
        'JWT_SECRET=your-32-character-secret-key-here': f'JWT_SECRET={jwt_secret}',
        'MONGO_PASSWORD=app_secure_pass': f'MONGO_PASSWORD={mongo_password}',
        'app_secure_pass@app-mongo': f'{mongo_password}@app-mongo',
        'app_secure_pass@localhost': f'{mongo_password}@localhost',
    }

    for old, new in replacements.items():
        content = content.replace(old, new)

    env_file.write_text(content)
    print(f"  Created .env with generated secrets")


def update_docker_compose(project_root: Path, slug: str) -> None:
    """Update docker-compose.yml with project-specific names."""
    docker_compose = project_root / "docker-compose.yml"

    if not docker_compose.exists():
        print("  Warning: docker-compose.yml not found")
        return

    replacements = {
        "app-mongo": f"{slug}-mongo",
        "app-redis": f"{slug}-redis",
        "app-backend": f"{slug}-backend",
        "app-frontend": f"{slug}-frontend",
        "app_mongo_data": f"{slug}_mongo_data",
        "app_redis_data": f"{slug}_redis_data",
    }

    if replace_in_file(docker_compose, replacements):
        print(f"  Updated docker-compose.yml with {slug}-* service names")


def update_nginx_config(project_root: Path, slug: str) -> None:
    """Update nginx.conf with project-specific backend name."""
    nginx_conf = project_root / "frontend" / "nginx.conf"

    if not nginx_conf.exists():
        print("  Warning: frontend/nginx.conf not found")
        return

    replacements = {
        "app-backend": f"{slug}-backend",
    }

    if replace_in_file(nginx_conf, replacements):
        print(f"  Updated nginx.conf with {slug}-backend")


def update_readme(project_root: Path, app_name: str, slug: str) -> None:
    """Update README.md with project name."""
    readme = project_root / "README.md"

    if not readme.exists():
        print("  Warning: README.md not found")
        return

    replacements = {
        "Core Platform Template": app_name,
        "core-platform": slug,
    }

    if replace_in_file(readme, replacements):
        print(f"  Updated README.md with project name")


def cleanup_template_files(project_root: Path) -> None:
    """Remove template-specific files that aren't needed in new projects."""
    files_to_remove = [
        "init-project.py",  # This script itself
    ]

    for file_name in files_to_remove:
        file_path = project_root / file_name
        if file_path.exists():
            file_path.unlink()
            print(f"  Removed {file_name}")


def main():
    parser = argparse.ArgumentParser(
        description="Initialize a new project from the core platform template"
    )
    parser.add_argument(
        "--name",
        required=True,
        help="Human-readable project name (e.g., 'My Awesome App')"
    )
    parser.add_argument(
        "--slug",
        required=True,
        help="URL/Docker-friendly slug (e.g., 'my-awesome-app')"
    )
    parser.add_argument(
        "--no-cleanup",
        action="store_true",
        help="Don't remove template files after initialization"
    )

    args = parser.parse_args()

    # Validate slug format
    if not re.match(r'^[a-z][a-z0-9-]*$', args.slug):
        print("Error: Slug must start with a letter and contain only lowercase letters, numbers, and hyphens")
        sys.exit(1)

    project_root = Path(__file__).parent.resolve()

    print(f"\n🚀 Initializing project: {args.name}")
    print(f"   Slug: {args.slug}")
    print(f"   Root: {project_root}\n")

    print("📝 Creating configuration files...")
    create_env_file(project_root, args.name, args.slug)

    print("\n🐳 Updating Docker configuration...")
    update_docker_compose(project_root, args.slug)
    update_nginx_config(project_root, args.slug)

    print("\n📖 Updating documentation...")
    update_readme(project_root, args.name, args.slug)

    if not args.no_cleanup:
        print("\n🧹 Cleaning up template files...")
        cleanup_template_files(project_root)

    print("\n✅ Project initialized successfully!")
    print("\n📋 Next steps:")
    print(f"   1. Review and edit .env file with your settings")
    print(f"   2. Run: docker compose up --build")
    print(f"   3. Access the app at http://localhost:3700")
    print(f"   4. Login with the admin credentials from .env")
    print()


if __name__ == "__main__":
    main()
