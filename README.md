# btcServer
1.
read from file

2.
insert into db

3.
truncate txs;
truncate tx_inputs;
truncate tx_outputs;

truncate tx_addresses;

4.
select count(*) from txs UNION ALL
select count(*) from tx_inputs UNION ALL
select count(*) from tx_outputs UNION ALL
select count(*) from tx_addresses;


5.
SET GLOBAL local_infile=1;
