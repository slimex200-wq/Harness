# Harness Strategy - {{role}} (v{{generation}})

## Profile
- **Role**: {{role}}
- **Stack**: {{stack}}
- **Workflow**: {{workflow}}
- **Constraints**: {{constraints}}

## Previous Generation Feedback
{{parent_feedback}}

---

## CLAUDE.md Rules

### NEVER
{{never_rules}}

### ALWAYS
{{always_rules}}

### Workflow
{{workflow_definition}}

### Agents (Auto-Use)
{{agent_auto_rules}}

---

## settings.json

### Permissions
```json
{
  "allow": [{{allow_list}}],
  "deny": [{{deny_list}}]
}
```

### Hooks
{{hooks_design}}

### Environment
```json
{
  "env": {{{env_vars}}}
}
```

---

## Skills

### ECC Skills (Install)
| Skill | Reason |
|-------|--------|
{{ecc_skills_table}}

### Custom Skills (Generate)
{{custom_skills}}

### Bootstrap
- harness-maker/SKILL.md (자기 복제)

---

## Agents
{{agents_definitions}}

---

## Commands
{{commands_definitions}}

---

## Hooks Scripts
{{hooks_scripts}}

---

## Quality Targets
- audit 목표 점수: {{target_score}}/70
- 필수 카테고리: {{required_categories}}
