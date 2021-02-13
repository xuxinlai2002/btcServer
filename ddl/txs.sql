SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for txs
-- ----------------------------
DROP TABLE IF EXISTS `txs`;
CREATE TABLE `txs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `txid` varchar(65) NOT NULL COMMENT '交易hash',
  `block_number` bigint(16) DEFAULT NULL COMMENT '区块高度',
  `block_timestamp` varchar(10) DEFAULT NULL COMMENT '时间戳',
  `is_coinbase` smallint(1) DEFAULT NULL COMMENT '是否coinbase',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;