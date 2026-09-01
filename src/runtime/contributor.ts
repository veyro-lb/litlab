import '../contributor-program';
// The submit owner must register immediately after the form renderer, before any enhancement,
// validation, role, or promotion capture listeners can intercept the button click.
import '../contributor-submit-direct';
import '../contributor-program-enhancements';
import '../contributor-form-validation';
import '../contributor-teacher-application';
import '../contributor-promotion-focus';
import '../contributor-account-role';
import '../contributor-account-workflow';
import '../contributor-history';
import '../contributor-chat';
import '../contributor-docx-upload';
import '../contributor-workspace';
import '../contributor-program-v3';
import '../contributor-delete';
import '../contributor-pdf-delivery';
import '../contributor-completion-archive';
import '../contributor-teacher-workspace-polish';
import '../contributor-review-flow-polish';
import '../contributor-review-relationship-center';
import '../contributor-new-application-toggle';
import '../contributor-entry-prompt';

import '../admin-analytics';
import '../admin-account-role-badges';
import '../admin-account-delete';
import '../admin-contributors';
import '../admin-contributor-final-status-label';
import '../admin-contributor-workspace';
import '../admin-contributor-workspace-form-preserver';
import '../admin-contributor-program-v3';
import '../admin-contributor-certificates';
import '../contributor-review-lifecycle';
import '../contributor-docx-turn-lock';
import '../contributor-final-review-clarity';
import '../admin-final-doc-single-highlight';
import '../contributor-workspace-updates';
import '../admin-contributor-workspace-updates';
import '../contributor-direct-actions';
import '../contributor-completion-mentor-fix';
import '../contributor-role-hard-guard';
import '../contributor-teacher-student-roster';
import '../contributor-compact-chat';
import '../contributor-application-launcher';
import '../contributor-page-experience';
import '../contributor-system-audit';
import '../contributor-state-guide';
import '../contributor-guide-action-bridge';
import '../contributor-journey-coherence';
import '../contributor-journey-live-sync';
import '../contributor-guide-navigation-stability';
import '../contributor-guide-scroll-hotfix';
import '../admin-feedback';
import '../admin-feedback-refresh-fix';

// These were previously pulled into every route through interaction-health.
// Keep them scoped to contributor/admin pages while preserving their behavior there.
import '../contributor-notification-open-guard';
import '../contributor-live-sync';
import '../contributor-activity-live-sync';
import '../contributor-secure-document-download';

// Final contributor QA layer: responsive containment, duplicate-render protection,
// visual normalization, task-first dashboard experience, action reliability,
// revision submission shortcut, then teacher-guide action sanity.
import '../contributor-qa-polish.css';
import '../contributor-qa-runtime';
import '../contributor-visual-pass.css';
import '../contributor-guide-visibility.css';
import '../contributor-dashboard-experience';
import '../contributor-dashboard-action-guard';
import '../contributor-revision-submit-guide';
import '../contributor-teacher-guide-sanity';

// Role-aware reviewer layer: separates academic English review from CAS supervision,
// adds structured feedback and optional private annotated DOCX handoff.
import '../contributor-role-aware-review';
import '../contributor-reviewer-role-form-polish';
import '../contributor-reviewer-scope-sync';
// Final workspace adapter: the selected reviewer role/perspective controls the actual
// rubric language, feedback prompts, approval meaning, declaration and submit action.
import '../contributor-review-role-workspace';
// Account-level reviewer specialization is the final authority. Existing Teacher accounts
// are asked once, and the persisted choice drives the application and review workspace.
import '../contributor-reviewer-specialization';
// Role cards are selection-only; a separate confirmation step performs the permanent save.
import '../contributor-reviewer-specialization-confirm';
// Final reviewer UX layer: spacious rubric cards, guided steps, progress and subtle motion.
import '../contributor-review-workspace-experience';

export {};
