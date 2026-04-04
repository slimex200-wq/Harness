#!/bin/bash
# PostToolUse: Auto flutter pub get on pubspec.yaml change
set -euo pipefail
flutter pub get 2>&1 | tail -5
