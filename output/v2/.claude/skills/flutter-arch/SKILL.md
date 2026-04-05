---
name: flutter-arch
description: "Flutter MVVM + Repository 아키텍처 규칙 검증. 레이어 경계, import 규칙, 디렉토리 구조 강제."
---

# Flutter Architecture

MVVM + Repository 패턴 준수를 검증한다.

## When to Activate

- 새 파일 생성 시
- import 변경 시
- "/arch-check" 트리거

## Directory Structure

```
lib/
  ui/              # 화면, 위젯 (View + ViewModel)
    screens/
    widgets/
    viewmodels/
  data/            # 데이터 소스, Repository
    repositories/
    models/
    services/      # Firebase 서비스 래퍼
  di/              # 의존성 주입 (Riverpod providers)
  core/            # 공통 유틸, 상수, 테마
```

## Rules

1. **UI → Data 단방향**: `lib/ui/`는 `lib/data/`만 import 가능
2. **Firebase 격리**: Firebase 패키지는 `lib/data/services/`에서만 import
3. **Repository 패턴**: ViewModel은 Repository만 의존, Firebase 직접 접근 금지
4. **Provider 위치**: Riverpod provider는 `lib/di/`에 정의
5. **네이밍**: 파일명 snake_case, 클래스명 PascalCase
6. **파일 크기**: 800줄 이하

## Violation Report

```
VIOLATION: lib/ui/screens/home_screen.dart:5
  import 'package:cloud_firestore/cloud_firestore.dart';
  Rule: UI layer cannot import Firebase directly
  Fix: Use repository from lib/data/repositories/
```
