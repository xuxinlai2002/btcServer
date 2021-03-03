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



cat testStr.txt | redis-cli --pipe

----------------------------------------------
redis-cli hgetall out > out.txt
redis-cli hgetall addr2Bal > addr2Bal.txt
-----------------------------------------------

cat filename | head -n 50 | tail -n +10  显示10行到50行


15.
select count(*) from address_balance
select count(*) from (select count(*) from tx_addresses GROUP BY address) temp

select address,sum(value) as val from tx_addresses GROUP BY address
order by val desc

16.
node redisData.js 0

node redisSortTxByAddress.js 0
node redisResult 0
node txAddresses2DB.js 0

17.

redis-cli --pipe



cat /Users/xuxinlai/ela/btcServer/bk/rok/sum-150000-159999-1-addr2Bal-00000.txt | redis-cli --pipe
cat /Users/xuxinlai/ela/btcServer/bk/rok/sum-150000-159999-1-out-00000.txt | redis-cli --pipe







