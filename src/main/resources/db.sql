-- MySQL Workbench Synchronization
-- Generated: 2018-02-08 16:34
-- Model: New Model
-- Version: 1.0
-- Project: Name of the project
-- Author: seven

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

ALTER SCHEMA `wechatspider`  DEFAULT CHARACTER SET utf8  DEFAULT COLLATE utf8_general_ci ;

CREATE TABLE IF NOT EXISTS `wechatspider`.`account` (
  `id` BIGINT(20) NOT NULL,
  `biz` VARCHAR(100) NOT NULL COMMENT '公众号的唯一标识',
  `nickname` VARCHAR(100) NOT NULL COMMENT '昵称',
  `headimg` VARCHAR(300) NULL DEFAULT NULL COMMENT '公众号LOGO',
  `crawl_time` BIGINT(20) NOT NULL COMMENT '抓取时间，时间戳',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_biz` (`biz` ASC))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8
  COMMENT = '微信公众号信息';

CREATE TABLE IF NOT EXISTS `wechatspider`.`article` (
  `id` BIGINT(20) NOT NULL,
  `biz` VARCHAR(50) NOT NULL COMMENT '公众号唯一标识',
  `title` VARCHAR(100) NOT NULL COMMENT '文章标题',
  `digest` VARCHAR(200) NULL DEFAULT NULL COMMENT '文章副标题',
  `content` TEXT(5000) NULL DEFAULT NULL COMMENT '文章内容',
  `content_url` VARCHAR(200) NULL DEFAULT NULL COMMENT '微信的详细连接地址',
  `source_url` VARCHAR(200) NULL DEFAULT NULL COMMENT '原文地址',
  `author` VARCHAR(50) NULL DEFAULT NULL COMMENT '作者',
  `cover` VARCHAR(100) NULL DEFAULT NULL COMMENT '文章图片连接',
  `copyright_stat` INT(11) NULL DEFAULT NULL COMMENT '文章是否原创标识 11为原创 100为无原创 101为转发',
  `read_num` INT(11) NOT NULL DEFAULT 0 COMMENT '阅读量',
  `like_num` INT(11) NOT NULL DEFAULT 0 COMMENT '点赞量',
  `datetime` BIGINT(20) NOT NULL COMMENT '发布时间',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_biz_title` (`title` ASC, `biz` ASC),
  INDEX `idx_biz` (`biz` ASC))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
