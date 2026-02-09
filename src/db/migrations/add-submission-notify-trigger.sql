-- Create function to notify on new submissions
CREATE OR REPLACE FUNCTION notify_new_submission()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'submission_created',
    json_build_object(
      'id', NEW.id,
      'campaign_id', NEW.campaign_id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS submission_created_trigger ON submissions;
CREATE TRIGGER submission_created_trigger
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_submission();
