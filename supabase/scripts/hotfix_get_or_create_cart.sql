-- Выполнить в Supabase SQL Editor, если корзина не создаётся (RLS на orders).
-- Пересоздаёт RPC с SECURITY DEFINER (обход RLS при INSERT корзины).

CREATE OR REPLACE FUNCTION public.get_or_create_cart(p_user_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id INTEGER;
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid()::text THEN
        RAISE EXCEPTION 'forbidden';
    END IF;

    SELECT id INTO v_order_id
    FROM public.orders
    WHERE user_id = p_user_id AND status = 'in_cart'
    LIMIT 1;

    IF v_order_id IS NOT NULL THEN
        RETURN v_order_id;
    END IF;

    INSERT INTO public.orders (user_id, status, total_price)
    VALUES (p_user_id, 'in_cart', 0)
    RETURNING id INTO v_order_id;

    RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_cart(TEXT) TO authenticated;
