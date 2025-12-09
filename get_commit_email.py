#!/usr/bin/env python3
"""
Extract commit author email from GitHub API
Usage: python3 get_commit_email.py <repo_path> <commit_hash>
Example: python3 get_commit_email.py talal-atiq/blogging-app-devops abc123
"""
import sys
import json
import urllib.request

def get_commit_email(repo_path, commit_hash):
    """Get the commit author email from GitHub API"""
    try:
        url = f"https://api.github.com/repos/{repo_path}/commits/{commit_hash}"
        headers = {'Accept': 'application/vnd.github.v3+json'}
        
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            # Extract author email from commit.author.email
            email = data.get('commit', {}).get('author', {}).get('email', '')
            
            if email:
                print(email)
                return 0
            else:
                print("", file=sys.stderr)
                return 1
                
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 get_commit_email.py <repo_path> <commit_hash>", file=sys.stderr)
        sys.exit(1)
    
    repo_path = sys.argv[1]
    commit_hash = sys.argv[2]
    
    sys.exit(get_commit_email(repo_path, commit_hash))
