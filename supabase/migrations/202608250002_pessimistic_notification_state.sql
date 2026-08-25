alter table public.orders
alter column notification_state set default 'failed';

update public.orders
set notification_state = 'failed'
where notification_state = 'pending';

alter table public.orders
drop constraint orders_notification_state_check;

alter table public.orders
add constraint orders_notification_state_check
check (notification_state in ('sent', 'failed'));
