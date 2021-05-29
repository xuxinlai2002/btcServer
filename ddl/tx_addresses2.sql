SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for tx_addresses02
-- ----------------------------
DROP TABLE IF EXISTS `tx_addresses02`;
CREATE TABLE `tx_addresses02` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `address` varchar(32) DEFAULT NULL COMMENT '地址',
  `value` bigint(16) DEFAULT NULL COMMENT '值',
  `isIn` smallint(1) DEFAULT NULL COMMENT '是否是收入 0:支出 1:收入',
  `block_number` bigint(16) DEFAULT NULL COMMENT '区块高度',
  `block_timestamp` varchar(10) DEFAULT NULL COMMENT '时间戳',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;