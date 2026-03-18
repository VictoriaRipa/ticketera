-- Fix event policies so organizers can see their draft events
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON events;

-- Allow everyone to see published events, and organizers to see all their events
CREATE POLICY "Events viewable policy" ON events
FOR SELECT USING (
  status = 'published' 
  OR organizer_id = auth.uid()
);

-- Also allow admins to see all events
DROP POLICY IF EXISTS "Admins can view all events" ON events;
CREATE POLICY "Admins can view all events" ON events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
