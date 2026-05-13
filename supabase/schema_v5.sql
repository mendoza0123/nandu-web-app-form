-- Migration v5: partial Google Sheets sync.
-- After every 5 unsent answers (or at completion), the server fires the
-- existing GOOGLE_SHEETS_WEBHOOK_URL with the unsent batch and flips
-- this flag, so each answer reaches the sheet exactly once.

alter table interview_answers
  add column if not exists sent_to_sheets boolean not null default false;

create index if not exists idx_interview_answers_unsent
  on interview_answers(session_id)
  where sent_to_sheets = false;
