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
show index from tx_outputs;

8.
select address ,count(*) cnt from tx_addresses 
GROUP BY address 
HAVING cnt > 3

9.
12higDjoCCNXSA95xZMWUdPvXNmkAduhWv
select * from tx_addresses 
where address = '12higDjoCCNXSA95xZMWUdPvXNmkAduhWv'
order by block_number 

10.
node redisSortTxByAddress.js 125000

11.
cat /Users/xuxinlai/ela/btcServer/rok/idx-0~119999.txt | redis-cli --pipe

12.

cat testBin.txt | redis-cli --pipe

13.
HLEN xxxx

14.
导入
导出
https://blog.csdn.net/wppwpp1/article/details/108109464





