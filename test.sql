with
	tab1 as (
		select 100 as pid, date '2020-08-29' as start_date, date '2020-09-03' as end_date
		union all
		select 100 as pid, date '2020-08-02' as start_date, date '2020-08-06' as end_date
		union all
		select 100 as pid, date '2020-08-11' as start_date, date '2020-08-17' as end_date
-- 		union all
-- 		select 100 as pid, date '2020-08-02' as start_date, date '2020-08-23' as end_date
	),
	tab2 as (
		select 100 as pid, date '2020-08-23' as start_date, date '2020-08-27' as end_date
		union all
		select 100 as pid, date '2020-08-06' as start_date, date '2020-08-13' as end_date
		union all
		select 100 as pid, date '2020-09-02' as start_date, date '2020-09-08' as end_date
		union all
		select 100 as pid, date '2020-08-16' as start_date, date '2020-08-21' as end_date
	),
	view_all as (
		select * from tab1
		union all
		select * from tab2
	),
	result_or as (
		with recursive rec(pid, start_date, end_date, next_date) as (
			select pid, start_date, end_date, start_date from view_all
			union all
			select distinct v.pid, rec.start_date, greatest(first_value(v.end_date) over w, rec.end_date), first_value(v.start_date) over w
			from view_all v, rec
			where v.pid = rec.pid
			and v.start_date > rec.next_date
			and v.start_date between rec.start_date and rec.end_date
			window w as (partition by v.pid order by v.start_date, v.end_date desc)
		)
		select pid, lower(_range) as start_date, upper(_range) as end_date
		from (
			select
				distinct pid,
				(
					select tsrange(min(start_date), max(end_date), '[]') as _range
					from rec
					where pid = r1.pid
					and tsrange(start_date, end_date, '[]') && tsrange(r1.start_date, r1.end_date, '[]')
				)
			from rec r1
		) _tmp
	)
select * from result_or
