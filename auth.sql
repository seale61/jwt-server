DROP DATABASE IF EXISTS `auth`;
CREATE DATABASE `auth`;
USE `auth`;

DROP TABLE IF EXISTS `tokens`;
CREATE TABLE `tokens` (
  `token_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `site` varchar(20) NOT NULL,
  `user_id` varchar(60) NOT NULL,
  `token` text DEFAULT NULL,
  `create_time` bigint(20) DEFAULT NULL,
  `invalid` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`token_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


DELIMITER ;;
CREATE PROCEDURE `check_token`(IN p_token TEXT)
BEGIN
	SELECT token FROM tokens WHERE token = p_token AND NOT invalid;
END ;;
DELIMITER ;

DELIMITER ;;
CREATE PROCEDURE `kill_token`(IN p_token TEXT)
BEGIN
	UPDATE tokens SET invalid = 1 WHERE token = p_token AND NOT invalid;
END ;;
DELIMITER ;

DELIMITER ;;
CREATE PROCEDURE `store_token`(IN `p_site` VARCHAR(20), IN `p_user_id` VARCHAR(60), IN `p_token` TEXT, IN `p_create_time` BIGINT(20))
BEGIN
	INSERT INTO tokens (
		site, 
		user_id, 
		token, 
		create_time
	) VALUES (
		p_site, 
		p_user_id, 
		p_token, 
		p_create_time
	);
END ;;
DELIMITER ;
