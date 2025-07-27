#!/bin/bash

set -e

# python3 -m venv venv
# source venv/bin/activate
# pip install -r requirements.txt

for f in test_*.py; do
  echo "Running $f..."
  python "$f"
  echo "---"
done

echo "All Selenium E2E tests completed." 