#!/bin/bash

for (( i = 0; i < $2; i++ ))
do
    fromNum=$[ $1 + $i*100 ]
    endNum=$[ $1 + ($i + 1)*100 -1 ]
    
    strCmd="docker run -v /home/dev/output/:/bitcoin-etl/output bitcoin-etl:latest export_blocks_and_transactions --start-block $fromNum --end-block $endNum --provider-uri http://user:pass@10.0.3.238:8332 --chain bitcoin --transactions-output output/transactions-$fromNum.json"

    #echo $strCmd
    ${strCmd}
    echo "---------------------- $i -------------------------------"
done