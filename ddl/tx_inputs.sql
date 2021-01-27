SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for tx_inputs
-- ----------------------------
DROP TABLE IF EXISTS `tx_inputs`;
CREATE TABLE `tx_inputs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `txid` varchar(65) NOT NULL COMMENT '交易hash',
  `spend_tx_hash` varchar(65) DEFAULT NULL COMMENT '花费交易hash',
  `spend_output_index` bigint(16) DEFAULT NULL COMMENT '花费输出index',
  `addresses` varchar(1024) DEFAULT NULL COMMENT '地址',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;