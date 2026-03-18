-- Allow users to create tickets for their own orders
CREATE POLICY "Users can create tickets for own orders" ON public.tickets FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
