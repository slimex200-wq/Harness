#!/bin/bash
# 체크포인트 저장/로드/확인 유틸리티
# Usage:
#   checkpoint.sh save <generation> <milestone> <data_file>
#   checkpoint.sh load <generation> <milestone>
#   checkpoint.sh exists <generation> <milestone>
#   checkpoint.sh latest <generation>

set -euo pipefail

CHECKPOINT_DIR="${HARNESS_ROOT:-.}/.checkpoints"

cmd="${1:-}"
gen="${2:-}"
milestone="${3:-}"

case "$cmd" in
  save)
    data_file="${4:-}"
    if [[ -z "$gen" || -z "$milestone" || -z "$data_file" ]]; then
      echo "Usage: checkpoint.sh save <generation> <milestone> <data_file>" >&2
      exit 1
    fi
    dir="$CHECKPOINT_DIR/v$gen"
    mkdir -p "$dir"
    cp "$data_file" "$dir/$milestone.json"
    # 메타데이터 추가
    tmp=$(mktemp)
    jq --arg ms "$milestone" \
       --arg gen "$gen" \
       --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
       --arg status "completed" \
       '. + {milestone: $ms, generation: ($gen|tonumber), timestamp: $ts, status: $status}' \
       "$dir/$milestone.json" > "$tmp"
    mv "$tmp" "$dir/$milestone.json"
    echo "Checkpoint saved: v$gen/$milestone"
    ;;

  load)
    if [[ -z "$gen" || -z "$milestone" ]]; then
      echo "Usage: checkpoint.sh load <generation> <milestone>" >&2
      exit 1
    fi
    file="$CHECKPOINT_DIR/v$gen/$milestone.json"
    if [[ -f "$file" ]]; then
      cat "$file"
    else
      echo "Checkpoint not found: v$gen/$milestone" >&2
      exit 1
    fi
    ;;

  exists)
    if [[ -z "$gen" || -z "$milestone" ]]; then
      echo "Usage: checkpoint.sh exists <generation> <milestone>" >&2
      exit 1
    fi
    file="$CHECKPOINT_DIR/v$gen/$milestone.json"
    if [[ -f "$file" ]]; then
      echo "true"
    else
      echo "false"
    fi
    ;;

  latest)
    if [[ -z "$gen" ]]; then
      echo "Usage: checkpoint.sh latest <generation>" >&2
      exit 1
    fi
    dir="$CHECKPOINT_DIR/v$gen"
    if [[ -d "$dir" ]]; then
      ls -t "$dir"/*.json 2>/dev/null | head -1 | xargs -r basename | sed 's/.json$//'
    else
      echo "none"
    fi
    ;;

  *)
    echo "Usage: checkpoint.sh {save|load|exists|latest} ..." >&2
    exit 1
    ;;
esac
