SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for tx_outputs
-- ----------------------------
DROP TABLE IF EXISTS `tx_outputs`;
CREATE TABLE `tx_outputs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `txid` varchar(65) NOT NULL COMMENT '交易hash',
  `output_index` int(4) DEFAULT NULL COMMENT 'output_index',
  `addresses` varchar(1024) DEFAULT NULL COMMENT '地址',
  `value` bigint(16) DEFAULT NULL COMMENT '值',
  `is_used` smallint(1) DEFAULT 0 COMMENT '是否已使用',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;