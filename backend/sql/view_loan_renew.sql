-- create view view_loan_renew as
select 
header.loan_header_id,
customer_id, cfname, cmname, clname, 
payment.PrincipalBalance as PrincipalBalance, 
payment.PenaltyBalance as Penalty,
payment.InterestBalance as InterestBalance,
payment.Balance as Balance

from view_loan_header as header

inner join new_payment as payment 
on header.loan_header_id
