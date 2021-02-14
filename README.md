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

6.
#cat test.txt | redis-cli -h 127.0.0.1 -a xxl123456 -p 6379 --pipe

-----
cat out-0.txt | redis-cli --pipe
redis-cli flushall
npm install redis-dump -g
redis-dump > dump.txt

7.
ALTER TABLE `tx_inputs` ADD INDEX input_tx ( `txid` ) 





