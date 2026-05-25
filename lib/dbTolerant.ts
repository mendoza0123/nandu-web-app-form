/**
 * Detect a "column does not exist" error so call sites can decide to
 * retry the same query with the optional column dropped. Used wherever
 * we SELECT audio_transcript (or any future-migration column) before
 * the user has run the matching SQL migration.
 *
 * Postgres / Supabase returns either:
 *   "column interview_answers.audio_transcript does not exist"
 *   "Could not find the 'audio_transcript' column of 'interview_answers' in the schema cache"
 * Match either by checking the column name + a known marker.
 */
export function isColumnMissingError(err: any, column: string): boolean {
  if (!err) return false;
  const blob = JSON.stringify(err).toLowerCase();
  const col = column.toLowerCase();
  return (
    blob.includes(col) &&
    (blob.includes('does not exist') ||
      blob.includes('schema cache') ||
      blob.includes('column'))
  );
}
