-- Migration v2: enforce one answer per (session, question) so re-answering via Back
-- (or any re-submit) updates the existing row instead of creating duplicates.
--
-- Safe to run multiple times.
-- Pre-flight: confirm there are no existing duplicates.
--   select session_id, question_id, count(*)
--   from interview_answers
--   group by 1, 2
--   having count(*) > 1;
-- If any rows appear, deduplicate before applying the constraint.

alter table interview_answers
  drop constraint if exists interview_answers_session_question_unique;

alter table interview_answers
  add constraint interview_answers_session_question_unique
  unique (session_id, question_id);
