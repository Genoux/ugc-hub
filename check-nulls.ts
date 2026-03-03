import { neon } from "@neondatabase/serverless";
const sql = neon("postgresql://neondb_owner:npg_UNJ07rKEFofa@ep-wandering-cake-aidsaiht-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
const rows = await sql`
  SELECT COUNT(*) as count FROM collaborations
  WHERE collaboration_status = 'closed'
  AND (
    rating_visual_quality IS NULL OR
    rating_acting_delivery IS NULL OR
    rating_reliability_speed IS NULL OR
    pieces_of_content IS NULL OR
    total_paid IS NULL OR
    closed_at IS NULL OR
    closed_by IS NULL
  )
`;
console.log(JSON.stringify(rows));
