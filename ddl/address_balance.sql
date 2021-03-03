SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for txs
-- ----------------------------
DROP TABLE IF EXISTS `address_balance`;
CREATE TABLE `address_balance` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `address` varchar(128) DEFAULT NULL COMMENT '地址',
  `value` bigint(16) DEFAULT NULL COMMENT '值',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;